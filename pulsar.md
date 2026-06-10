# Pulsar 渐进式理解：从简单队列到存算分离

每一步对照 Kafka 怎么做，凸显 Pulsar 的取舍。

## 1. 一个 Topic 怎么扛住高吞吐

- **Kafka**：Topic 切 Partition，每个 Partition 是一台 Broker 上的一个本地日志文件。
- **Pulsar**：Topic 也分 Partition，但每个 Partition 不是文件，是一段"逻辑日志"。

**差别**：Kafka 的 Partition 和某台机器绑死；Pulsar 的 Partition 和机器解耦。后面所有差异都是这一脚踩出来的。

## 2. 一份消息想被多种姿势消费

- **Kafka**：只有 Consumer Group，组内共享分区、组间各看各的。位点客户端 / `__consumer_offsets` 自管。
- **Pulsar**：**Subscription 是服务端对象**。同一 Topic 挂 N 个 Subscription，每个 Subscription 自己挑模式：独占 / 主备 / 共享 / Key_Shared。

**差别**：Pulsar 把"队列"和"发布订阅"统一成"订阅模式"的选项；Key_Shared 还能在共享消费下保住同 Key 顺序——Kafka 做不到。

## 3. Broker 挂了 / 要扩容

- **Kafka**：Partition 的 Leader 切换还好，**真要扩容得 reassign**，搬 TB 级数据，慢。
- **Pulsar**：Broker 不存数据，只持有"我现在负责哪些 Topic"。挂了别的 Broker 接管即可，**搬的是元数据不是数据**。

**差别**：这就是"存算分离"真正值钱的地方——弹性。

## 4. 那数据放哪

- **Kafka**：Broker 自己管本地盘。
- **Pulsar**：丢给 **BookKeeper**。一个 Topic 物理上是一串 Ledger，每个 Ledger 的副本撒在若干 Bookie 上，参数 E / Qw / Qa 控制副本池 / 写副本 / ack 副本。

**差别**：Bookie 是纯粹的"只追加日志服务"，跟 Broker 各自独立扩缩。

## 5. 谁记 Broker 状态、Topic 归属

- **Kafka**：以前 ZK，现在 KRaft 自己搞 Raft。
- **Pulsar**：Metadata Store 抽象，可插 ZK / etcd / Oxia。负载均衡单位是 **Bundle**（一组 Topic 打包搬）。

**差别**：Kafka 在收敛成自洽系统；Pulsar 选择把元数据外置、保持组件单一职责。

## 6. 数据要留半年

- **Kafka**：本地盘扛着，或上 Confluent 的 Tiered Storage（商业版 / KIP-405 在路上）。
- **Pulsar**：**原生 Tiered Storage**，冷 Ledger 自动卸到 S3 / OSS，客户端无感。

**差别**：Pulsar 因为本来就是 Ledger 链，卸载一段冷的非常自然。

## 7. 跨机房

- **Kafka**：MirrorMaker / Confluent Replicator，外置工具。
- **Pulsar**：**Geo-Replication 内置**，命名空间级开关，Broker 之间直接异步复制。

---

## 一句话总结

Kafka 把"Broker 管一切"做到了极致并不断自我收敛；Pulsar 一开始就把它拆成 **无状态 Broker + 日志存储 BookKeeper + 元数据中心**，并把"订阅"做成服务端公民——代价是组件多、运维面更宽，回报是弹性、消费灵活性、原生多租户 / 跨地域 / 冷热分层。
