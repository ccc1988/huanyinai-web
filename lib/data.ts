// ============================================================
// 寰引智能官网 — 集中数据管理
// 数据源：PRD v1.3 附录 A（案例/客户/行业）+ 附录 B（博客）
// ============================================================

// ===== 核心类型定义 =====

export interface CaseItem {
  slug: string;
  title: string;
  industry: string;
  relatedCustomers: string[];
  oneLiner: string;
  painPoints: string[];
  solution: string;
  customerValue: string[];
  metrics?: string[];
  scenarios: string[];
  tags: string[];
  hasDetailPage: boolean;
}

export interface IndustrySolution {
  slug: string;
  title: string;
  subtitle: string;
  painPoints: string[];
  solutionSummary: string;
  relatedCases: string[];
  faq: { q: string; a: string }[];
}

export interface Customer {
  name: string;
  industry: string;
  solutions: string[];
}

export interface CapabilityItem {
  module: string;
  products: string[];
  scenarios: string;
  icon: string; // Lucide 图标名
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  date: string;
  author: string;
  sections: { heading: string; body: string }[];
}

export interface StatItem {
  value: number;
  suffix?: string;
  label: string;
}

// ===== 公司信息 =====

export const company = {
  fullName: "寰引智能科技（深圳）有限公司",
  shortName: "寰引智能",
  description: "面向企业的 AI 转型落地服务商",
  website: "https://www.huanyin.ai",
  wechat: "huanyin-ai",
  email: "contact@huanyin.ai",
  phone: "待填写",
  foundingDate: "2024",
  location: "深圳",
};

// ===== 客户列表（附录 A.1）=====

export const customers: Customer[] = [
  { name: "海格物流股份", industry: "综合物流", solutions: ["AI 智能客服", "AI 订单智能体", "AI 知识库", "发票助手"] },
  { name: "达九州供应链", industry: "供应链", solutions: ["AI 智能客服", "AI 报价智能体", "AI 订单智能体", "AI 物流轨迹"] },
  { name: "三陌跨境", industry: "跨境电商", solutions: ["跨境商品 AI 智能生产系统"] },
  { name: "启航跨境物流", industry: "跨境物流", solutions: ["物流订单 AI 智能系统", "应付单录入与往来核销"] },
  { name: "三洋电商", industry: "跨境电商", solutions: ["跨境商品 AI 智能生产系统", "电商收款流水对账"] },
  { name: "佰瑞纳家具", industry: "外贸制造", solutions: ["AI 数字员工外贸业务员", "AI 客服智能体"] },
  { name: "万汉制药", industry: "制药", solutions: ["AI 质检智能体"] },
  { name: "海纳供应链", industry: "供应链", solutions: ["AI 销售智能体", "AI 电商客服智能体"] },
  { name: "翱航供应链", industry: "供应链", solutions: ["AI 报关文件系统", "财务凭证批量生成与日记账"] },
  { name: "Anker", industry: "跨境电商", solutions: ["Anker 商品采集与监控平台"] },
];

// ===== 能力矩阵（附录 A.2）=====

export const capabilities: CapabilityItem[] = [
  {
    module: "AI 智能体",
    products: ["客服智能体", "订单智能体", "报价智能体", "质检智能体"],
    scenarios: "客户服务自动化、订单处理、质量检测",
    icon: "Bot",
  },
  {
    module: "AI 文档处理",
    products: ["报关文件 AI", "商品 AI 生产", "财务凭证生成"],
    scenarios: "单证识别、内容生成、数据自动化",
    icon: "FileText",
  },
  {
    module: "RPA 自动化",
    products: ["表格录入", "模板转换", "电子签章", "流程衔接"],
    scenarios: "重复操作替代、多系统数据流转",
    icon: "Workflow",
  },
  {
    module: "数据智能",
    products: ["物流轨迹追踪", "商品采集监控", "异常预警", "经营看板"],
    scenarios: "实时监控、风险预警、决策支持",
    icon: "BarChart3",
  },
];

// ===== 数据指标（首页区块 7）=====

export const stats: StatItem[] = [
  { value: 10, suffix: "+", label: "企业客户" },
  { value: 11, suffix: "+", label: "落地系统" },
  { value: 6, label: "行业覆盖" },
  { value: 10, suffix: "x+", label: "人效提升" },
];

// ===== 案例列表（附录 A.3 - A.7）=====

export const cases: CaseItem[] = [
  // 案例 1 — 有详情页
  {
    slug: "customs-document-ai",
    title: "报关文件 AI 智能处理系统",
    industry: "报关",
    relatedCustomers: ["启航跨境物流", "翱航供应链"],
    oneLiner: "将清关资料与 BL 提单识别升级为「上传即识别、结构化输出、结果可导出可同步」的标准化能力，让单据处理从人工整理走向自动化协作。",
    painPoints: [
      "跨境清关资料（Excel/CSV）和 BL 提单（PDF）依赖人工逐条录入、反复核对",
      "多人协作时数据版本不一致，错填漏填风险高",
      "单据归档分散，缺乏统一台账和系统对接能力",
    ],
    solution: "搭建统一入口的 AI 智能识别流程，上传文件后自动完成字段提取、结构化输出，支持本地导出、飞书同步及系统对接，适配私有化部署与团队协同。",
    customerValue: [
      "减少重复录入和人工核对，单据处理效率显著提升",
      "降低错填漏填带来的返工成本和合规风险",
      "团队基于统一结果协同处理，新人上手更快",
    ],
    metrics: [
      "每票处理时间从 15 分钟缩短到 1 分钟以内",
      "字段提取错误率从行业平均 3%-5% 降至 0.5% 以内",
      "日处理 200 票的团队每月可节省超过 400 小时重复劳动",
    ],
    scenarios: [
      "跨境物流公司、报关服务商、外贸企业、关务部门、单证中心",
      "覆盖清关资料整理、BL 提单识别、台账同步归档和多系统对接",
    ],
    tags: ["效率显著提升", "结构化输出", "私有化部署"],
    hasDetailPage: true,
  },
  // 案例 2
  {
    slug: "cross-border-logistics-ai",
    title: "跨境物流 AI 智能系统",
    industry: "跨境物流",
    relatedCustomers: ["启航跨境物流"],
    oneLiner: "将人工盯表、改表、核表的清关资料流程升级为自动识别、规则校验、标准输出与异常提醒的一体化系统。",
    painPoints: [
      "业务资料格式多样，人工整理和校验耗时耗力",
      "熟手依赖度高，团队扩张时难以快速复制经验",
      "多客户多模板场景下，交付一致性难以保证",
    ],
    solution: "系统对上传的 Excel 等业务资料自动完成字段提取、规则校验、标准表生成与异常提示，把分散、重复、易错的处理流程固化为一套可持续运行的标准作业方式。",
    customerValue: [
      "减少对熟手的依赖，降低错漏和返工",
      "处理效率提升，交付更稳定",
      "团队扩张时流程可快速复制落地",
    ],
    scenarios: ["跨境物流资料整理", "报关单证处理", "多模板表格标准化", "关务协作提效", "订单高峰期批量处理"],
    tags: ["标准化流程", "规则校验", "异常提醒"],
    hasDetailPage: false,
  },
  // 案例 3 — 有详情页
  {
    slug: "ecommerce-ai-production",
    title: "跨境商品 AI 智能生产系统",
    industry: "跨境电商",
    relatedCustomers: ["三陌跨境", "三洋电商"],
    oneLiner: "将商品从采集、文案、图片到上架发布的完整链条，收口为一套可管理、可交付、可持续运行的 AI 生产流程。",
    painPoints: [
      "商品上新链路长：采集表 → 文案 → 图片 → 平台模板回填，依赖人工拆分复制",
      "多账号运营时权限混乱、任务进度不透明",
      "缺乏管理视角：余额、消耗、操作记录无法统一管控",
    ],
    solution: "企业级 AI 商品处理方案，以批次方式完成表 1 上传 → AI 中间表生成 → 表 3 上架表输出 → 结果下载，适配企业自定义模板。配套企业账号、子账号权限隔离、任务进度、异常重跑、审计留痕和离线部署能力。",
    customerValue: [
      "运营团队：批量商品内容处理效率实现量级提升，减少重复复制和手工回填",
      "管理层：清晰掌握企业、账号、任务、余额、消费和操作记录",
      "成本可控：低余额时自动拦截高成本任务，避免失控支出",
    ],
    metrics: [
      "人效提高 10 倍以上",
      "支持多账号权限隔离、任务进度追踪、异常重跑",
      "低余额自动拦截，成本可控",
    ],
    scenarios: [
      "跨境电商商家、商品运营团队、代运营机构",
      "批量商品上新、表格化内容处理、图片生成与整理、平台模板回填",
      "多账号协同、私有化交付",
    ],
    tags: ["人效提高10倍", "多账号管理", "离线部署"],
    hasDetailPage: true,
  },
  // 案例 4
  {
    slug: "ecommerce-ai-service-rpa",
    title: "电商 AI 智能客服与 RPA 自动化接待系统",
    industry: "电商客服",
    relatedCustomers: ["海纳供应链"],
    oneLiner: "以 Coze AI 工作流理解客户意图、生成回复，用影刀 RPA 接入现有客服工作台执行消息处理，实现低改造、快速上线的智能客服试点。",
    painPoints: [
      "客服每天重复回答尺码推荐、商品咨询、售后问题，人效低",
      "大促期间咨询量暴增，人工客服产能跟不上",
      "不想重做整套客服系统，希望低成本接入 AI 能力",
    ],
    solution: "Coze AI 工作流负责理解客户问题、匹配商品知识并生成回复；影刀 RPA 负责在现有客服工作台中读取消息、执行回复、衔接订单信息，无需改造原有系统即可快速上线。",
    customerValue: [
      "高频售前售后问题由 AI 承接，人工客服聚焦复杂纠纷和高价值客户",
      "首次响应速度和咨询转化效率提升",
      "新人客服借助标准话术和推荐逻辑，接待质量更稳定",
    ],
    scenarios: ["淘宝、天猫、抖店、拼多多等电商客服团队", "服饰、美妆、食品、家居、数码配件等咨询量大的店铺", "大促期间客服产能快速补充"],
    tags: ["AI客服", "影刀RPA", "低改造上线"],
    hasDetailPage: false,
  },
  // 案例 5 — 有详情页
  {
    slug: "logistics-tracking-ai",
    title: "AI 物流轨迹实时追踪与预警系统",
    industry: "物流",
    relatedCustomers: ["达九州供应链", "海格物流股份"],
    oneLiner: "把「人盯网页」升级为「系统自动抓取 + 状态看板 + 异常通知」，让业务团队从被动查单转向主动预警。",
    painPoints: [
      "需反复登录多个船司官网、港口网站、单一窗口查询运单状态",
      "手工复制轨迹到表格跟进，效率低、易漏单",
      "延误往往事后才发现，缺乏提前预警机制",
    ],
    solution: "以提单号/SO 号为入口，通过后端 RPA 自动抓取各查询来源的最新物流节点、船期状态、到离港进展，在统一看板中沉淀为可查询、可统计、可预警的轨迹数据，支持 ETD/ETA 超期、离港/到港超时等风险自动通知。",
    customerValue: [
      "少人工查网页，少漏单，少延误后才发现",
      "业务人员精力聚焦在异常处理和客户沟通上",
      "管理层通过看板掌握整体运单状态和风险数量",
    ],
    metrics: [
      "异常发现时间从平均滞后 24 小时缩短到实时",
      "操作员不再需要每天花 1-2 小时逐网站查单",
      "支持多船司、多港口、多节点实时监控",
    ],
    scenarios: [
      "国际物流、货代、跨境供应链、海外仓",
      "批量订阅提单/SO、实时跟踪船司与港口节点、异常预警",
      "向客户同步物流进度",
    ],
    tags: ["主动预警", "实时看板", "异常通知"],
    hasDetailPage: true,
  },
  // 案例 6
  {
    slug: "logistics-wecom-ai",
    title: "AI 物流智能客服与企微外部群协同系统",
    industry: "物流",
    relatedCustomers: ["海格物流股份"],
    oneLiner: "让 AI 客服在企业微信外部群中自动接待、自动查询、定时推送，把客户沟通从人工盯群升级为自动化协同。",
    painPoints: [
      "客服需在企业微信外部群逐条回复报价、轨迹查询、POD 下载等重复问题",
      "客户群数量多，依赖熟手逐群盯屏，服务一致性难以保证",
      "轨迹通知靠人工推送，时效性差、易遗漏",
    ],
    solution: "AI 客服接入企业微信外部客户群，自动理解客户意图，联动运单、报价、轨迹数据给出对应回复；同时按计划向指定客户群定时推送货物路由、到港/离港进度和 POD 上传信息，支持推送日志查询。",
    customerValue: [
      "重复性问题处理量减少 60% 以上",
      "客户平均等待回复时间从 5 分钟缩短到 1 分钟以内",
      "从被动响应转向主动通知，客户粘性增强",
    ],
    metrics: [
      "重复性问题处理量减少 60% 以上",
      "客户平均等待回复时间从 5 分钟缩短到 1 分钟以内",
    ],
    scenarios: ["国际物流、货代、专线服务商", "拥有大量企业微信外部客户群、需要 7x24 小时初步响应、批量路由通知、报价承接和订单处理协同的团队"],
    tags: ["企微群协同", "定时推送", "自动回复"],
    hasDetailPage: false,
  },
  // 案例 7
  {
    slug: "rpa-data-entry",
    title: "业务系统表格自动化录入 RPA",
    industry: "RPA",
    relatedCustomers: ["启航跨境物流"],
    oneLiner: "将逐条复制、核对、提交的表格录入工作，转换为可批量执行的自动化流程。",
    painPoints: ["业务人员每天需在 ERP/WMS/TMS 等系统中逐条录入大量订单、客户、运单数据。"],
    solution: "RPA 模拟人工在网页端或客户端表单中批量录入表格数据，支持校验、回填、异常提示和结果留痕。",
    customerValue: ["减少人工敲表时间，降低错录漏录风险，快速见效。"],
    scenarios: ["ERP、WMS、TMS、CRM、客服工单系统的高频表格数据录入岗位"],
    tags: ["批量录入", "结果留痕", "快速见效"],
    hasDetailPage: false,
  },
  // 案例 8
  {
    slug: "rpa-template-conversion",
    title: "数据模板转换 RPA",
    industry: "RPA",
    relatedCustomers: ["通用"],
    oneLiner: "自动将不同来源的表格数据按规则转换成统一模板，消除手工搬数据和改格式的重复劳动。",
    painPoints: ["多供应商提供的表格格式各异，与内部导入模板不匹配，需人工逐份转换。"],
    solution: "RPA 自动读取不同来源的 Excel/CSV 文件，按字段映射和格式规则批量转换成目标模板。",
    customerValue: ["统一标准、节省整理时间，降低因格式不一致导致的导入失败和数据遗漏。"],
    scenarios: ["采购、供应链、物流、财务等需要汇总多供应商数据的团队"],
    tags: ["格式统一", "批量转换", "字段映射"],
    hasDetailPage: false,
  },
  // 案例 9
  {
    slug: "rpa-customs-sorting",
    title: "报关单整理 RPA",
    industry: "报关",
    relatedCustomers: ["翱航供应链"],
    oneLiner: "将分散的报关数据自动整理成内部系统的标准报关单模板，提高出单效率和文件规范性。",
    painPoints: ["报关资料分散且格式不一，人工整理耗时且容易出错。"],
    solution: "RPA 自动完成字段归集、格式整理、数据校验和模板输出，快速生成可直接使用的标准报关单。",
    customerValue: ["减少整理时间，提高数据一致性，降低返工成本。"],
    scenarios: ["报关行、货代、关务和单证团队的批量报关资料整理与归档"],
    tags: ["标准模板", "数据校验", "批量归档"],
    hasDetailPage: false,
  },
  // 案例 10
  {
    slug: "rpa-e-stamp",
    title: "报关文件电子章整合输出 RPA",
    industry: "报关",
    relatedCustomers: ["翱航供应链"],
    oneLiner: "批量加盖电子章、统一命名、分类归档，一键输出完整报关资料包。",
    painPoints: ["报关单、发票、装箱单等文件需逐份加盖电子章并整理归档，工作繁琐易遗漏。"],
    solution: "RPA 按规则批量加盖电子章、统一命名、分类归档，整合输出为一份完整的报关文件夹。",
    customerValue: ["文件交付更规范，签章归档自动化，提升合规性与可追溯性。"],
    scenarios: ["需要批量制作报关文件包、统一加盖电子章、快速归档和对外提交的团队"],
    tags: ["电子签章", "批量归档", "合规可追溯"],
    hasDetailPage: false,
  },
  // 案例 11
  {
    slug: "anker-data-platform",
    title: "Anker 商品采集与监控平台",
    industry: "跨境电商",
    relatedCustomers: ["Anker"],
    oneLiner: "将分散在多平台、多国家站点的商品数据统一采集、沉淀、监控，让运营团队在一个数据中心里掌握全局商品表现。",
    painPoints: [
      "商品分布在多个电商平台和不同国家站点，运营需频繁跨平台登录查看、搬运数据",
      "价格、标题、链接、上架状态和关键指标分散零碎，无法集中对比和监控",
      "采集结果质量参差不齐，异常记录难以及时发现和跟进",
    ],
    solution: "系统自动采集各电商平台的商品价格、标题、链接、上架状态及关键指标，在数据中心统一沉淀到结果页面，运营人员可按国家、站点、平台维度集中查看和监控商品表现。",
    customerValue: [
      "多平台多国家站点商品信息汇总到同一数据中心，减少人工跨平台查看和搬运数据的时间",
      "系统及时识别采集是否成功、结果是否合格、是否存在待推送或异常记录",
      "帮助团队快速发现问题、补充监控，持续维护商品数据质量",
    ],
    scenarios: ["跨境电商品牌方、商品运营团队和数据采集团队", "持续监控多平台商品数据、统一整理采集结果、跟踪推送状态和维护商品资产"],
    tags: ["多平台采集", "数据中心", "异常监控"],
    hasDetailPage: false,
  },
];

// ===== 行业解决方案（附录 A.8）=====

export const industries: IndustrySolution[] = [
  {
    slug: "customs",
    title: "报关行业 AI 解决方案",
    subtitle: "从人工逐条录入到上传即识别、结构化输出",
    painPoints: [
      "跨境清关资料（Excel/CSV/PDF）格式多样，人工逐条录入耗时耗力",
      "多人协作版本不一致，错填漏填风险高",
      "单据归档分散，缺乏统一台账",
      "报关文件需逐份加盖电子章并整理归档，工作繁琐",
    ],
    solutionSummary: "AI 智能识别 + RPA 自动化双管齐下：上传文件即自动提取字段并结构化输出；RPA 自动整理报关单模板、批量加盖电子章、统一归档。",
    relatedCases: ["customs-document-ai", "rpa-customs-sorting", "rpa-e-stamp"],
    faq: [
      { q: "报关文件 AI 智能处理系统能解决什么问题？", a: '寰引智能的报关文件 AI 系统可将跨境清关资料和 BL 提单从人工录入升级为"上传即识别、结构化输出、结果可导出可同步"的自动化流程，显著提升单据处理效率。' },
      { q: "系统支持哪些文件格式？", a: "支持 Excel、CSV、PDF 等主流格式，自动识别文件结构并提取核心字段。" },
      { q: "部署方式是什么？", a: "支持私有化部署与团队协同，数据不出企业。" },
    ],
  },
  {
    slug: "cross-border-logistics",
    title: "跨境物流 AI 解决方案",
    subtitle: "从被动查单到主动预警，从人工盯群到自动协同",
    painPoints: [
      "业务资料格式多样，人工整理和校验耗时",
      "物流轨迹需反复登录多个船司官网查询，效率低",
      "客户群咨询量大，依赖人工逐条回复",
      "异常往往事后才发现，缺乏提前预警",
    ],
    solutionSummary: "AI 智能识别系统自动处理清关资料；物流轨迹追踪系统自动抓取多源数据并预警；AI 客服接入企微外部群自动回复报价和轨迹查询。",
    relatedCases: ["cross-border-logistics-ai", "logistics-tracking-ai", "logistics-wecom-ai"],
    faq: [
      { q: "跨境物流 AI 智能系统和传统软件有什么区别？", a: "寰引智能的系统自动完成字段提取、规则校验、标准表生成与异常提示，把分散、重复、易错的处理流程固化为标准作业方式，减少对熟手的依赖。" },
      { q: "物流轨迹追踪系统支持哪些查询来源？", a: "支持各大船司官网、港口网站、单一窗口等，通过 RPA 自动抓取最新物流节点、船期状态和到离港进展。" },
      { q: "企业微信外部群能实现什么？", a: "AI 客服自动回复报价、轨迹查询、POD 下载等重复问题，并按计划定时推送货物路由和到港/离港信息。" },
    ],
  },
  {
    slug: "cross-border-ecommerce",
    title: "跨境电商 AI 解决方案",
    subtitle: "从人工上新到 AI 批量生产，人效提升 10 倍以上",
    painPoints: [
      "商品上新链路长，依赖人工拆分复制",
      "多账号运营权限混乱，任务进度不透明",
      "客服咨询量大，重复问题多",
      "多平台商品数据分散，无法集中监控",
    ],
    solutionSummary: "跨境商品 AI 智能生产系统实现采集 → 文案 → 图片 → 上架一条龙；AI 客服 + RPA 自动化接待高频问题；商品采集与监控平台统一管理多平台数据。",
    relatedCases: ["ecommerce-ai-production", "ecommerce-ai-service-rpa", "anker-data-platform"],
    faq: [
      { q: "跨境商品 AI 智能生产系统的人效提升体现在哪里？", a: "以批次方式完成表 1 上传 → AI 中间表生成 → 表 3 上架表输出，减少人工重复复制和手工回填，人效提高 10 倍以上。" },
      { q: "多账号如何管理？", a: "配套企业账号和子账号权限隔离，支持任务进度追踪、异常重跑、审计留痕和离线部署。" },
      { q: "AI 客服需要改造现有系统吗？", a: "不需要。影刀 RPA 在现有客服工作台执行操作，无需改造原有系统即可快速上线。" },
    ],
  },
  {
    slug: "manufacturing",
    title: "制造与外贸 AI 解决方案",
    subtitle: "AI 数字员工 + AI 质检，让工厂从自动化走向智能化",
    painPoints: [
      "外贸业务员需处理大量重复性询盘和跟单工作",
      "制造环节质量检测依赖人工，效率低且标准不一致",
      "业务系统数据录入依赖人工，易出错",
    ],
    solutionSummary: "AI 数字员工承担外贸业务员重复性工作；AI 质检智能体自动化产品检测；RPA 自动化处理表格录入和模板转换。",
    relatedCases: ["rpa-data-entry", "rpa-template-conversion"],
    faq: [
      { q: "AI 数字员工外贸业务员能做什么？", a: "自动处理询盘回复、订单跟进、数据录入等重复性工作，让外贸业务员聚焦在高价值客户沟通和谈判上。" },
      { q: "AI 质检智能体适用于哪些场景？", a: "适用于制药、制造等行业的产品质检环节，自动化检测并标记异常，降低漏检率。" },
    ],
  },
  {
    slug: "supply-chain",
    title: "供应链 AI 解决方案",
    subtitle: "AI 智能客服 + 报价/订单/销售智能体，全链路提效",
    painPoints: [
      "供应链企业客户咨询量大，客服成本高",
      "报价、订单处理依赖人工，响应慢",
      "销售跟进缺乏数据支撑",
    ],
    solutionSummary: "AI 智能客服自动回复高频问题；AI 报价智能体自动调取最新报价；AI 订单智能体处理订单流程；AI 销售智能体辅助销售跟进。",
    relatedCases: ["cross-border-logistics-ai", "logistics-tracking-ai"],
    faq: [
      { q: "供应链企业适合用哪些 AI 智能体？", a: "寰引智能已为达九州供应链、海纳供应链等客户部署 AI 智能客服、AI 报价智能体、AI 订单智能体和 AI 物流轨迹，覆盖客服、报价、订单和物流全链路。" },
      { q: "实施周期长吗？", a: "项目制交付，通常数周内完成试点上线，无需改造原有系统。" },
    ],
  },
  {
    slug: "ecommerce-service",
    title: "电商客服 AI 解决方案",
    subtitle: "Coze AI + 影刀 RPA，低成本快速上线智能客服",
    painPoints: [
      "客服每天重复回答尺码推荐、商品咨询、售后问题",
      "大促期间咨询量暴增，产能跟不上",
      "不想重做整套客服系统，希望低成本接入",
    ],
    solutionSummary: "Coze AI 工作流理解客户意图并生成回复，影刀 RPA 在现有客服工作台执行消息处理和订单衔接，无需改造原有系统。",
    relatedCases: ["ecommerce-ai-service-rpa", "logistics-wecom-ai"],
    faq: [
      { q: "AI 智能体和传统软件有什么区别？", a: "寰引智能的 AI 智能体基于 Coze AI 工作流理解客户意图并生成回复，结合影刀 RPA 接入现有业务系统执行操作，无需改造原有系统即可快速上线。" },
      { q: "企业做 AI 转型需要多长时间？", a: "寰引智能已为 10+ 企业客户交付 11+ 智能化系统，覆盖物流、跨境电商、制造等 6 大行业，通常项目制交付周期为数周。" },
    ],
  },
];

// ===== 博客文章（附录 B）=====

export const blogPosts: BlogPost[] = [
  {
    slug: "customs-50w-tickets",
    title: "年处理 50 万票的跨境物流公司，用 AI 把报关效率提升了 10 倍",
    excerpt: "一家年处理 50 万票报关单的跨境物流公司，每票从 15 分钟手工录入缩短到 1 分钟 AI 识别。每月节省超过 400 小时重复劳动，字段错误率从 3%-5% 降至 0.5% 以内。",
    category: "深度案例",
    tags: ["跨境物流", "AI报关", "物流效率", "数字化转型"],
    date: "2026-06-30",
    author: "寰引智能",
    sections: [
      { heading: "一个被忽视的隐形瓶颈", body: "跨境物流的复杂度不仅体现在运输链条长、环节多上，还隐藏在一个少有人注意的环节——清关资料的整理与校验。每个客户都有自己的表格模板，每票货物涉及的文件格式各异。在没有系统支撑的情况下，关务人员只能靠人工处理：手动识别、人工校验、手工填表、人工复核。这套流程不仅耗时，而且高度依赖熟手经验。一个新人至少需要 3-6 个月才能独立完成。" },
      { heading: "痛点到底有多痛", body: "一家年处理 50 万票报关单的跨境物流公司，平均每天处理 1369 票。每票需要人工阅读 Excel、CSV、PDF 格式的清关资料，将关键字段提取出来录入业务系统。一个老练的关务员处理一票需要 3 分钟，1369 票等于 68 小时。而他们只有 37 个人。" },
      { heading: "换一个思路", body: "把 Excel、CSV、PDF 文件直接上传，系统自动识别文件结构，无论是横排表格还是竖排字段，都能准确提取核心信息。所有提取的数据自动对齐为标准字段格式，用户在线预览、校对、修正，然后一键导出。" },
      { heading: "实际效果", body: "原先每票 15 分钟的手工录入，缩短到 1 分钟以内的 AI 识别加人工确认。一个日处理 200 票的团队，每月可节省超过 400 小时的重复劳动。字段提取错误率从行业平均的 3%-5% 降至 0.5% 以内。" },
      { heading: "一些思考", body: "如果你也在为清关资料处理效率发愁，欢迎在评论区聊聊你的业务场景。" },
    ],
  },
  {
    slug: "logistics-auto-tracking",
    title: "还在让员工每天刷船司网站查物流？这套系统把人盯网页变成了自动预警",
    excerpt: "货代公司操作员每天登录 7-8 个船司网站逐个查单，异常发现平均滞后 24 小时。RPA 自动抓取 + AI 解析 + 实时看板 + 异常通知，让操作员从被动查单转向主动预警。",
    category: "深度案例",
    tags: ["跨境物流", "物流追踪", "RPA", "AI预警"],
    date: "2026-07-07",
    author: "寰引智能",
    sections: [
      { heading: "为什么人盯网页查物流行不通", body: "问题集中在三个方面：第一，信息来源分散。一个集装箱从出发到抵达，可能经过 4-5 个船司、3-4 个港口。每个节点的数据分散在不同的系统里。第二，被动等待异常。早上 8 点查完，9 点出了异常，就要等到第二天才能发现。晚了一整天。第三，事后追溯困难。客户投诉时难以快速给出完整的轨迹时间线。" },
      { heading: "把人工盯查变成系统自动监测", body: "RPA 机器人模拟人工操作，自动登录各大船司网站抓取物流节点信息。AI 模型解析数据，识别关键节点状态。所有数据实时汇总到一个可视化看板。异常自动触发通知。" },
      { heading: "效果", body: "操作员不再需要每天花 1-2 小时逐网站查单。异常发现时间从平均滞后 24 小时缩短到实时。客户问单时不再需要去翻 Excel。" },
    ],
  },
  {
    slug: "wecom-ai-customer-service",
    title: "企业微信外部群还在靠人工盯？AI 客服替你回复报价和轨迹查询",
    excerpt: "物流公司客服需同时维护十几个企微外部群，重复性问题占比超 60%。AI 客服接入企微群自动回复报价和轨迹查询，重复性问题处理量减少 60%，客户平均等待时间从 5 分钟缩短到 1 分钟以内。",
    category: "深度案例",
    tags: ["跨境物流", "AI客服", "企业微信", "效率工具"],
    date: "2026-07-14",
    author: "寰引智能",
    sections: [
      { heading: "物流行业特有的群聊困局", body: "国际物流行业的客户服务，有一种特殊的场景——企业微信外部群。每个客户建一个群，群里除了客服人员，还有客户的采购、物流、财务等多个对接人。客服需要同时维护十几个甚至几十个外部群。客户问得最多的问题就三类：现在什么价？我的货到哪了？什么时候能到？这些问题高度重复，但又必须逐条回复。" },
      { heading: "换个方式", body: "把 AI 客服接入企业微信外部群。当客户在群里提问时，AI 自动理解客户意图——是问报价还是查轨迹。如果是问报价，AI 自动从系统调取最新报价数据生成回复。如果是查轨迹，AI 自动查询物流状态返回最新节点信息。客服只需要审核和确认。此外还支持定时推送：每天早上自动推送前一天轨迹更新汇总，每周自动推送最新运价行情。" },
      { heading: "效果", body: "客服人员的重复性问题处理量减少 60% 以上。客户平均等待回复时间从 5 分钟缩短到 1 分钟以内。" },
    ],
  },
];

// ===== 导航菜单 =====

export const navItems = [
  { label: "解决方案", href: "/solutions/customs" },
  { label: "案例", href: "/cases/customs-document-ai" },
  { label: "关于", href: "/about" },
  { label: "博客", href: "/blog" },
];

// ===== 辅助函数 =====

export function getCaseBySlug(slug: string): CaseItem | undefined {
  return cases.find((c) => c.slug === slug);
}

export function getCasesByIndustry(industrySlug: string): CaseItem[] {
  const industry = industries.find((i) => i.slug === industrySlug);
  if (!industry) return [];
  return industry.relatedCases
    .map((slug) => cases.find((c) => c.slug === slug))
    .filter(Boolean) as CaseItem[];
}

export function getIndustryBySlug(slug: string): IndustrySolution | undefined {
  return industries.find((i) => i.slug === slug);
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}
