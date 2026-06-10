// 知识图谱目录配置
// 新增文章: 在对应 group.items 里加一条 { id, title }，并在 articles/<id>.html 创建对应文件
window.MANIFEST = {
  site: {
    title: "知识图谱",
    subtitle: "后端工程师 · 速记 / 速答 / 速过"
  },
  groups: [
    {
      title: "Apache Pulsar",
      items: [
        { id: "pulsar/deep-dive-overview", title: "Pulsar 渐进式理解（总览）" },
        { id: "pulsar/storage-compute", title: "存算分离：Broker 无状态 + BookKeeper" },
        { id: "pulsar/bookkeeper", title: "BookKeeper 存储原理" },
        { id: "pulsar/subscription", title: "四种订阅模式" },
        { id: "pulsar/consumption", title: "消息投递：Ack / Cursor / 重投 / 死信" },
        { id: "pulsar/partitioned-topic", title: "分区 Topic 与无缝扩容" },
        { id: "pulsar/multi-tenancy", title: "多租户：Tenant / Namespace / Topic" },
        { id: "pulsar/tiered-storage", title: "分层存储与 Pulsar Functions" },
        { id: "pulsar/vs-kafka", title: "Pulsar vs Kafka 怎么选" }
      ]
    },
    {
      title: "Apache Kafka",
      items: [
        { id: "kafka/knowledge-graph", title: "Kafka 知识地图（总览）" },
        { id: "kafka/producer", title: "生产者原理" },
        { id: "kafka/consumer", title: "消费者与消费组 Rebalance" },
        { id: "kafka/replica", title: "副本机制：AR / ISR / HW / LEO" },
        { id: "kafka/election", title: "高可用：Controller 选举与防脑裂" },
        { id: "kafka/reliability", title: "可靠性：不丢 / 不重 / 有序 / 恰好一次" },
        { id: "kafka/storage", title: "存储机制与 offset 查找" },
        { id: "kafka/performance", title: "Kafka 为什么这么快" },
        { id: "kafka/kraft", title: "ZooKeeper vs KRaft" }
      ]
    },
    {
      title: "Golang 基础",
      items: [
        { id: "golang/01-basic/new-vs-make", title: "new vs make 的区别" },
        { id: "golang/01-basic/value-vs-reference", title: "Go 只有值传递？slice/map 像引用是怎么回事" },
        { id: "golang/01-basic/string-internals", title: "string 底层 & 不可变性" },
        { id: "golang/01-basic/iota", title: "iota 怎么用？" },
        { id: "golang/01-basic/closure", title: "闭包 & 变量捕获的坑" },
        { id: "golang/01-basic/panic-recover", title: "panic / recover 机制" },
        { id: "golang/01-basic/error-handling", title: "error 处理与 errors.Is/As/Unwrap" },
        { id: "golang/01-basic/init-order", title: "init 函数与包初始化顺序" },
        { id: "golang/01-basic/equality", title: "== 能比较哪些类型？" },
        { id: "golang/01-basic/type-assertion", title: "空 interface & 类型断言" },
        { id: "golang/01-basic/interface", title: "Interface 底层是怎么实现的？" }
      ]
    },
    {
      title: "Golang 进阶",
      items: [
        { id: "channel/csp", title: "CSP 模型：channel + select 的理论根基" },
        { id: "channel/internals", title: "Channel 底层实现与安全关闭" },
        { id: "channel/internals-memo", title: "  ↳ Channel 记忆法（怎么记住）" },
        { id: "channel/select", title: "select 是怎么工作的？" },
        { id: "channel/select-memo", title: "  ↳ select 记忆法（速记版）" },
        { id: "golang/02-advanced/slice", title: "Slice 底层是怎么实现的？" },
        { id: "golang/02-advanced/slice-memo", title: "  ↳ Slice 记忆法（速记版）" },
        { id: "golang/02-advanced/map", title: "Map 底层是怎么实现的？" },
        { id: "golang/02-advanced/map-memo", title: "  ↳ Map 底层记忆法（怎么记住）" },
        { id: "golang/02-advanced/defer", title: "Defer 是怎么实现的？" },
        { id: "golang/02-advanced/defer-memo", title: "  ↳ Defer 记忆法（速记版）" },
        { id: "golang/02-advanced/escape-analysis", title: "逃逸分析：什么变量会逃到堆？" },
        { id: "golang/02-advanced/escape-analysis-memo", title: "  ↳ 逃逸分析 记忆法（速记版）" },
        { id: "golang/02-advanced/struct-alignment", title: "struct 内存对齐 & 字段顺序优化" },
        { id: "golang/02-advanced/struct-alignment-memo", title: "  ↳ struct 内存对齐 记忆法（速记版）" },
        { id: "golang/02-advanced/sync-mutex", title: "sync.Mutex 原理" },
        { id: "golang/02-advanced/sync-mutex-memo", title: "  ↳ sync.Mutex 记忆法（速记版）" },
        { id: "golang/02-advanced/sync-rwmutex", title: "sync.RWMutex 原理" },
        { id: "golang/02-advanced/sync-rwmutex-memo", title: "  ↳ sync.RWMutex 记忆法（速记版）" },
        { id: "golang/02-advanced/sync-waitgroup-once", title: "sync.WaitGroup & sync.Once" },
        { id: "golang/02-advanced/sync-waitgroup-once-memo", title: "  ↳ sync.WaitGroup & sync.Once 记忆法（速记版）" },
        { id: "golang/02-advanced/sync-pool", title: "sync.Pool 原理与适用场景" },
        { id: "golang/02-advanced/sync-pool-memo", title: "  ↳ sync.Pool 记忆法（速记版）" },
        { id: "golang/02-advanced/sync-map", title: "sync.Map 实现与适用场景" },
        { id: "golang/02-advanced/sync-map-memo", title: "  ↳ sync.Map 记忆法（速记版）" },
        { id: "golang/02-advanced/atomic-cas", title: "atomic & CAS" },
        { id: "golang/02-advanced/atomic-cas-memo", title: "  ↳ atomic & CAS 记忆法（速记版）" },
        { id: "golang/02-advanced/context", title: "context 的设计与使用" },
        { id: "golang/02-advanced/context-memo", title: "  ↳ context 记忆法（速记版）" },
        { id: "golang/02-advanced/timer", title: "timer / ticker 底层实现" },
        { id: "golang/02-advanced/timer-memo", title: "  ↳ timer / ticker 记忆法（速记版）" },
        { id: "golang/02-advanced/range-gotchas", title: "range 的几个坑" },
        { id: "golang/02-advanced/range-gotchas-memo", title: "  ↳ range 的坑 记忆法（速记版）" },
        { id: "golang/02-advanced/reflect", title: "反射 reflect 原理与代价" },
        { id: "golang/02-advanced/reflect-memo", title: "  ↳ 反射 reflect 记忆法（速记版）" },
        { id: "golang/02-advanced/generics", title: "Go 泛型（1.18+）" },
        { id: "golang/02-advanced/generics-memo", title: "  ↳ Go 泛型 记忆法（速记版）" }
      ]
    },
    {
      title: "Golang 高级",
      items: [
        { id: "golang/03-expert/gpm-scheduler", title: "Go语言的GPM调度器是什么?" },
        { id: "golang/03-expert/gpm-scheduler-memo", title: "  ↳ GPM 调度器 记忆法（速记版）" },
        { id: "golang/03-expert/sudog", title: "sudog：goroutine 阻塞/唤醒的通用节点" },
        { id: "golang/03-expert/gc", title: "Golang的垃圾回收机制是如何工作的?" },
        { id: "golang/03-expert/memory-leak", title: "golang 内存泄漏怎么排查？" },
        { id: "golang/03-expert/netpoller", title: "netpoller 怎么把同步代码异步化？" },
        { id: "golang/03-expert/syscall-handoff", title: "syscall 阻塞时 P 怎么 hand-off？" },
        { id: "golang/03-expert/memory-allocator", title: "内存分配器 mcache / mcentral / mheap" },
        { id: "golang/03-expert/stack-management", title: "栈管理：分段栈 → 连续栈" },
        { id: "golang/03-expert/pprof", title: "pprof 实战：5 种 profile 各看什么" },
        { id: "golang/03-expert/trace", title: "trace 工具实战" },
        { id: "golang/03-expert/unsafe-pointer", title: "unsafe.Pointer 6 条规则" },
        { id: "golang/03-expert/cgo", title: "cgo 的开销与坑" }
      ]
    },
    {
      title: "Redis 基础",
      items: [
        { id: "redis/data-structures", title: "Redis 基础数据结构" },
        { id: "redis/internal-structures", title: "Redis中的底层数据结构" },
        { id: "redis/persistence", title: "Redis持久化的原理及优化" },
        { id: "redis/eviction", title: "Redis中内存淘汰算法实现" },
        { id: "redis/replication", title: "Redis主从复制原理" },
        { id: "redis/aof-rdb", title: "AOF 和 RDB 是什么? AOF 持久化策略" },
        { id: "redis/threaded-io", title: "Redis 6 里的 Threaded I/O 是想解决什么问题?" }
      ]
    },
    {
      title: "MySQL 相关",
      items: [
        { id: "mysql/architecture", title: "一条 SQL 是怎么执行的？" },
        { id: "mysql/index", title: "MySQL 索引原理" },
        { id: "mysql/transaction", title: "事务与隔离级别" },
        { id: "mysql/lock", title: "MySQL 锁机制" },
        { id: "mysql/logs", title: "三大日志：redo / undo / binlog" },
        { id: "mysql/engines", title: "InnoDB vs MyISAM 存储引擎" },
        { id: "mysql/optimization", title: "SQL 优化与慢查询" },
        { id: "mysql/replication", title: "MySQL 主从复制原理" }
      ]
    },
    {
      title: "PostgreSQL 相关",
      items: [
        { id: "pg/vs-mysql", title: "PostgreSQL vs MySQL 怎么选" },
        { id: "pg/architecture", title: "PostgreSQL 进程与内存架构" },
        { id: "pg/index", title: "PostgreSQL 索引类型" },
        { id: "pg/mvcc-vacuum", title: "MVCC 与 VACUUM" },
        { id: "pg/transaction", title: "事务与隔离级别（含 SSI）" },
        { id: "pg/wal", title: "WAL 与持久化" },
        { id: "pg/replication", title: "流复制与高可用" },
        { id: "pg/jsonb", title: "JSONB 与丰富数据类型" }
      ]
    },
    {
      title: "Apache Doris",
      items: [
        { id: "doris/overview", title: "Doris 是什么 · 架构与原理" },
        { id: "doris/data-model", title: "三种数据模型：Aggregate / Unique / Duplicate" },
        { id: "doris/storage", title: "存储与数据划分：分区 / 分桶 / Tablet" },
        { id: "doris/index", title: "Doris 索引机制" },
        { id: "doris/materialized-view", title: "物化视图与 Rollup" },
        { id: "doris/data-load", title: "数据导入：Stream / Broker / Routine Load" },
        { id: "doris/query", title: "查询执行：向量化 + MPP + Pipeline" },
        { id: "doris/vs", title: "Doris vs ClickHouse vs MySQL 怎么选" }
      ]
    }
  ]
};
