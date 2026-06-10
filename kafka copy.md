# Kafka 面试题库

按考点分组，每题给可背的骨架答案 + 加分点 + 易错追问。

---

## 一、基础概念

### Q1. Kafka 是什么？为什么用？

**核心**：分布式持久化提交日志（commit log）。它不是"消息队列"，是"日志"——队列、流、广播都是日志的视图。
**用途**：解耦、异步、削峰、流处理底座。
**特点**：高吞吐、低延迟、可水平扩展、消息可回放。

### Q2. Topic / Partition / Offset 的关系？

- Topic：逻辑分类
- Partition：Topic 的物理切片，每个是一个**有序追加日志**
- Offset：Partition 内消息唯一序号，单调递增

**坑**：消息顺序**只在同一 Partition 内**成立。

### Q3. Consumer Group 怎么实现"队列"和"广播"？

- 同一 Group：一个 Partition 只被组内一个 Consumer 消费 → **队列**
- 不同 Group：各自独立消费同一份 → **广播**
- 进度记录：`__consumer_offsets` 这个内部 Topic

### Q4. Partition 数量怎么定？

公式：`max(目标吞吐 / 单分区吞吐, 消费并行度需求)`
- **只能增不能减**，宁可适度多
- 太多的代价：连接/文件句柄/元数据开销，rebalance 变慢
- KRaft 后元数据上限大幅放宽

### Q5. 一个 Partition 能被组内多个 Consumer 消费吗？

不能。组内并发度上限 = 分区数。
**追问**："并发不够怎么办？" → 加分区；或选 Pulsar 的 Shared 订阅模式。

---

## 二、性能

### Q6. Kafka 为什么这么快？（必背六点）

1. **分区并行**：天然横向扩展
2. **顺序写**：机械盘也接近内存带宽
3. **PageCache**：写进缓存 OS 异步刷；读基本命中
4. **Zero-Copy**（sendfile）：磁盘 → 网卡，绕过用户态
5. **Batch + 压缩**：Producer 端压好，Broker 不解压直存
6. **Pull 模型**：Consumer 自控速率，不会被打爆

### Q7. Zero-Copy 是什么？

传统 4 次拷贝（盘 → 内核 → 用户 → socket → 网卡）。
`sendfile` 把内核 buffer 直转 socket buffer，少 2 次拷贝 + 上下文切换。
**前提**：Broker 不解析消息，所以可以直发字节。

### Q8. PageCache 在 Kafka 里起什么作用？

- 写：进 PageCache，OS 异步刷盘
- 读：实时消费基本命中 PageCache
- Kafka 不自维护缓存，把这个交给 OS——重启不冷启
- **对比 Pulsar**：Pulsar 自维护 EntryCache（堆外内存），有自己的取舍

### Q9. Batch / 压缩 / linger.ms 怎么配？

- `batch.size`：批大小
- `linger.ms`：攒批最长等多久
- 大 batch + 压缩 → **高吞吐高延迟**
- 小 batch / linger=0 → **低延迟低吞吐**
- 压缩首选 `lz4` / `zstd`（压缩比好、CPU 友好）

---

## 三、可靠性 / 一致性

### Q10. acks 0 / 1 / all 区别？

- `0`：发了就忘，可能丢
- `1`：Leader 写完即返回，**Leader 挂可能丢**
- `all`：所有 ISR 写完才返回，配 `min.insync.replicas` 才有意义

### Q11. ISR 是什么？什么时候副本被踢？

ISR = In-Sync Replicas，跟得上 Leader 的副本集合。
**踢出条件**：`replica.lag.time.max.ms`（默认 30s）内没追上 Leader。
ISR 收缩到 < `min.insync.replicas` 时，acks=all 写入直接被拒。

### Q12. min.insync.replicas 怎么配合 acks=all？

副本数 3、`min.insync.replicas=2`：
- 一台挂 → 还能写
- 两台挂 → 拒写（宁可不可用也不丢）

这是金融/订单类业务的强一致配法。

### Q13. HW 和 LEO 区别？

- **LEO**（Log End Offset）：副本本地写到哪
- **HW**（High Watermark）：所有 ISR 都已复制到的位置
- Consumer **只能读到 HW 之前**
- 这样 Leader 切换时新 Leader 不会丢"已被消费"的消息

### Q14. Unclean Leader Election？

允许非 ISR 副本上位 = 高可用但**会丢数据**。
默认关闭（`unclean.leader.election.enable=false`），生产推荐保持关闭。

---

## 四、Exactly-Once 语义

### Q15. 幂等 Producer 怎么实现？

`enable.idempotence=true`：
- Broker 给每个 Producer 分 PID
- 每个 (PID, 分区) 维护 sequence number
- Broker 拒重复 sequence
- **作用域**：单分区不重；跨分区要靠事务

### Q16. Kafka 事务怎么做？

- `transactional.id` + `initTransactions()`
- 原子写多分区 / 多 Topic
- **关键**：消费 offset 也写进事务（`sendOffsetsToTransaction`）
- Consumer 必须 `isolation.level=read_committed` 才能看到事务隔离

### Q17. Streams 的 EOS vs 外部系统？

- Kafka → Kafka（如 Streams）：内置事务能做端到端 EOS
- Kafka → 外部系统：Sink 端必须自己幂等或两阶段，否则只能 at-least-once

---

## 五、消费模型

### Q18. Rebalance 什么时候触发？

- 组内 Consumer 加入 / 离开 / 崩溃
- 订阅的 Topic 分区数变化
- 心跳超时（`session.timeout.ms`）

**为什么要避免**：Eager rebalance 期间整组停消费，Lag 立刻飙升。

### Q19. Cooperative vs Eager Rebalance？

- **Eager**：所有人放手再重分配 → 全停（stop-the-world）
- **Cooperative**：只交还需变动的分区，其余继续消费
- 2.4+ 默认 `CooperativeStickyAssignor`

### Q20. Static Membership？

`group.instance.id` 给 Consumer 稳定身份。
短暂离线（重启、网抖）不立刻触发 rebalance，优雅滚动发布场景必备。

### Q21. Offset 自动提交的坑？

`enable.auto.commit=true` 默认 5s 提交：
- 提交了但没处理完 → **丢**
- 处理完了没提交 → **重**

推荐：关掉自动提交，处理完再 `commitSync` / `commitAsync`。

### Q22. Pull vs Push 模型？

Kafka 用 Pull：
- Consumer 自控速率，慢消费者不会被打爆
- 代价：空轮询。靠 long-polling 缓解（`fetch.min.bytes` + `fetch.max.wait.ms`）

---

## 六、运维 / 场景题

### Q23. 消息积压（Lag 高）怎么办？

排查链：
1. 扩 Consumer（前提：分区数够）
2. 找消费逻辑慢点（外部接口、DB、锁）
3. 临时扩分区 + reassign（**慢且消耗 IO**）
4. 极端：临时新组从头消费 / 走专用快速通道丢弃非关键

### Q24. 消息丢失 / 重复在哪发生？

| 环节 | 丢失场景 | 重复场景 |
|------|---------|---------|
| Producer | acks=0/1 + 网络故障 | 重试（未开幂等） |
| Broker | unclean election + Leader 切 | - |
| Consumer | 自动提交后崩溃 | 已处理但 offset 未提交 |

### Q25. 怎么保证消息顺序？

- 单 Partition 内天然有序
- 同业务 Key（订单 ID）固定哈希到同一 Partition
- 全局有序 = 单分区，吞吐就上不去
- **坑**：`max.in.flight.requests.per.connection > 1` + 未开幂等时，重试可能乱序

### Q26. 一个 Broker 挂了会怎样？

- 它的 Leader 副本：Controller 在 ISR 内选新 Leader
- 它的 Follower 副本：剩下副本继续，恢复后追上
- 客户端：收到 `NotLeaderForPartition`，刷新元数据后重连
- 影响：ISR 收缩可能让 acks=all + min.insync 不满足而拒写

### Q27. ZK 和 KRaft 区别？

| 维度 | ZK | KRaft |
|------|----|-------|
| 元数据 | 外置 ZK | 内部 `__cluster_metadata` Topic |
| Controller | 单 Active | Raft Quorum |
| 部署 | 两个集群 | 一个 |
| 元数据规模 | 上万分区吃力 | 百万级可达 |

3.3+ 生产可用，4.0 默认 KRaft。

---

## 七、对比题

### Q28. Kafka vs RabbitMQ？

| 维度 | Kafka | RabbitMQ |
|------|-------|----------|
| 模型 | 持久化日志 | AMQP 队列 |
| 吞吐 | 百万级 | 万级 |
| 延迟 | 毫秒 | 微秒 |
| 路由 | 弱（按 Key 哈希到分区） | 强（Exchange 路由） |
| 适合 | 日志、流、高吞吐 | 业务消息、复杂路由 |

### Q29. Kafka vs RocketMQ？

- 模型相似（分区日志）
- RocketMQ：原生延迟消息 / 事务消息 / 消息轨迹更友好，国内文档多
- Kafka：生态全（Streams / Connect / Schema Registry），社区大
- **选型**：业务系统常 RocketMQ；数据/流处理常 Kafka

### Q30. Kafka vs Pulsar？

| 维度 | Kafka | Pulsar |
|------|-------|--------|
| 架构 | Broker 既算又存 | 存算分离（Broker + BookKeeper） |
| 扩容 | Reassign 搬数据慢 | Broker 秒迁、Bookie 独立扩 |
| 消费模型 | Consumer Group | 4 种 Subscription（Key_Shared 杀手锏） |
| 多租户 | ACL + 配额拼 | 原生 Tenant / Namespace |
| 跨地域 | MirrorMaker 2 外挂 | Geo-Replication 内置 |
| 分级存储 | KIP-405 / Confluent 商业版 | 原生 |
| 生态 | 远胜 | 追赶中 |

---

## 八、压轴：一句话讲明白 Kafka

> Kafka 是一个**分布式持久化提交日志**系统：靠"分区并行 + 顺序写 + PageCache + Zero-Copy"做到高吞吐，靠"多副本 + ISR + acks / min.insync"做到强一致，靠"Consumer Group + Offset"做到可水平扩展的消费——本质是把存储抽象成日志，让队列、流、回溯都从日志派生。

---

## 附录：必记参数速查

| 参数 | 含义 | 推荐值 |
|------|------|------|
| `acks` | Producer 等谁确认 | `all` |
| `min.insync.replicas` | 最小同步副本数 | 副本数 - 1 |
| `enable.idempotence` | Producer 幂等 | `true` |
| `max.in.flight.requests.per.connection` | 单连接未确认请求数 | 开幂等时 ≤ 5 |
| `compression.type` | 压缩算法 | `lz4` / `zstd` |
| `linger.ms` / `batch.size` | 攒批策略 | 按延迟容忍调 |
| `unclean.leader.election.enable` | 允许 Unclean | `false` |
| `enable.auto.commit` | Consumer 自动提交 | `false`（手动） |
| `isolation.level` | 事务隔离 | `read_committed` |
| `session.timeout.ms` / `heartbeat.interval.ms` | 心跳/超时 | 默认 + Static Membership |
