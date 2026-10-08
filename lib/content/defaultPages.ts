import type { PageContent } from "./pageSchema.ts";
export type { PageContent, PageBlock, PageBlockType } from "./pageSchema.ts";

// Exact public copy defaults from the isolated 2026-10-08 worktree.
export const DEFAULT_PAGES: PageContent[] = [
  {
    "pageKey": "home",
    "title": "首页",
    "seo": {},
    "blocks": [
      {
        "id": "home-hero",
        "type": "hero",
        "enabled": true,
        "order": 10,
        "props": {
          "titlePrimary": "AI 智能体与 AI 搜索获客",
          "titleSecondary": "重构业务流程，连接增长入口",
          "description": "为物流、跨境、制造、电商、金融等行业提供可落地的 AI 解决方案。",
          "primaryLabel": "预约 AI 解决方案咨询",
          "primaryHref": "/contact",
          "secondaryLabel": "查看案例",
          "secondaryHref": "/cases/customs-document-ai"
        }
      },
      {
        "id": "home-clients",
        "type": "richText",
        "enabled": true,
        "order": 20,
        "props": {
          "description": "跨行业服务经验 — 真实客户与典型业务场景"
        }
      },
      {
        "id": "home-capabilities",
        "type": "featureGrid",
        "enabled": true,
        "order": 30,
        "props": {
          "description": "从业务提效到增长获客，为企业提供可落地的 AI 产品与实施服务。",
          "title": "AI 应用与增长服务",
          "featuredEyebrow": "AI 搜索增长 · GEO / AEO",
          "featuredLead": "让品牌、产品与服务在 ",
          "searchEmphasis": "AI 搜索",
          "discoveryLead": " 中更容易",
          "discoveryEmphasis": "被发现",
          "questionLead": "；在 ",
          "questionEmphasis": "AI 提问",
          "recommendationLead": " 的答案中更容易被",
          "recommendationEmphasis": "理解、引用与推荐",
          "ctaHref": "/solutions/ai-geo-aeo",
          "ctaLabel": "查看方案"
        }
      },
      {
        "id": "home-industries",
        "type": "featureGrid",
        "enabled": true,
        "order": 40,
        "props": {
          "title": "行业解决方案",
          "painPointsTitle": "客户痛点",
          "solutionTitle": "解决方案",
          "casesLabel": "查看全部案例"
        }
      },
      {
        "id": "home-cases",
        "type": "featureGrid",
        "enabled": true,
        "order": 50,
        "props": {
          "title": "用真实交付说话",
          "readMoreLabel": "了解更多"
        }
      },
      {
        "id": "home-stats-copy",
        "type": "statsReference",
        "enabled": true,
        "order": 60,
        "props": {
          "title": "用数据证明实力",
          "description": "持续为企业创造可量化的 AI 价值"
        }
      },
      {
        "id": "home-ai-search-copy",
        "type": "richText",
        "enabled": true,
        "order": 70,
        "props": {
          "flowAriaLabel": "AI 搜索增长路径",
          "disclaimer": "提升进入相关答案的机会，不承诺固定排名或平台推荐。"
        }
      },
      {
        "id": "home-final-cta",
        "type": "cta",
        "enabled": true,
        "order": 90,
        "props": {
          "title": "把 AI 用在关键业务上",
          "description": "从内部提效到 AI 搜索增长，告诉我们你的场景，我们给出可执行的方案。",
          "label": "预约 AI 方案咨询",
          "href": "/contact"
        }
      }
    ]
  },
  {
    "pageKey": "about",
    "title": "关于我们",
    "seo": {},
    "blocks": [
      {
        "id": "about-intro",
        "type": "richText",
        "enabled": true,
        "order": 10,
        "props": {
          "eyebrow": "关于寰引智能",
          "title": "不是喊 AI 口号，是真正交付过",
          "introLead": "，定位为面向企业的 AI 转型落地服务商。 我们已服务 ",
          "customerCountLabel": " 企业客户、交付 ",
          "systemCountLabel": " 智能化系统、覆盖 ",
          "industryCountLabel": " 大行业解决方案， 核心竞争优势是有实际交付能力。",
          "capabilitiesTitle": "我们的能力边界",
          "industriesTitle": "行业覆盖",
          "customersTitle": "客户信任",
          "customersDescription": "多家真实企业客户选择寰引智能",
          "ctaHref": "/contact",
          "ctaLabel": "预约免费咨询"
        }
      }
    ]
  },
  {
    "pageKey": "contact",
    "title": "联系",
    "seo": {},
    "blocks": [
      {
        "id": "contact-intro",
        "type": "richText",
        "enabled": true,
        "order": 10,
        "props": {
          "eyebrow": "联系我们",
          "title": "让 AI 为你的企业创造价值",
          "description": "告诉我们你的业务场景，我们给出可落地的 AI 方案",
          "contactDetailsTitle": "联系方式",
          "wechatLabel": "微信咨询",
          "emailLabel": "邮箱",
          "phoneLabel": "电话",
          "addressLabel": "公司地址",
          "contactFallbackName": "联系人",
          "wechatFallbackName": "微信",
          "qrCodeLabel": "二维码",
          "wechatPrefix": "微信：",
          "formTitle": "预约咨询"
        }
      }
    ]
  },
  {
    "pageKey": "blog",
    "title": "行业洞察",
    "seo": {},
    "blocks": [
      {
        "id": "blog-list",
        "type": "hero",
        "enabled": true,
        "order": 10,
        "props": {
          "eyebrow": "行业洞察",
          "title": "AI 落地实践",
          "description": "真实案例背后的思考与方法论",
          "readMoreLabel": "阅读全文"
        }
      }
    ]
  },
  {
    "pageKey": "cases",
    "title": "客户案例",
    "seo": {},
    "blocks": [
      {
        "id": "cases-list",
        "type": "hero",
        "enabled": true,
        "order": 10,
        "props": {
          "homeHref": "/",
          "homeLabel": "首页",
          "breadcrumbLabel": "客户案例",
          "title": "客户案例",
          "introLead": "精选 ",
          "caseCountLabel": " 个公开案例，覆盖 ",
          "industryCountLabel": " 大行业场景，从痛点诊断到系统交付的真实实践",
          "caseCountCaption": "精选公开案例",
          "industryCountCaption": "行业覆盖",
          "groupCaseCountLabel": " 个案例",
          "ctaTitle": "你的企业也有类似需求？",
          "ctaDescription": "告诉我们你的业务场景，我们给出可落地的 AI 方案",
          "ctaHref": "/contact",
          "ctaLabel": "预约免费咨询"
        }
      }
    ]
  },
  {
    "pageKey": "solutions",
    "title": "解决方案",
    "seo": {},
    "blocks": [
      {
        "id": "solutions-list",
        "type": "hero",
        "enabled": true,
        "order": 10,
        "props": {
          "homeHref": "/",
          "homeLabel": "首页",
          "breadcrumbLabel": "解决方案",
          "title": "行业 AI 解决方案",
          "industryCountLabel": " 大行业全覆盖，精选 ",
          "caseCountLabel": " 个公开案例，从痛点诊断到智能体交付的全链路服务",
          "relatedCaseCountLabel": " 个关联案例",
          "viewSolutionLabel": "查看方案",
          "ctaTitle": "不确定哪个方案适合你？",
          "ctaDescription": "告诉我们你的业务场景，我们给出可落地的 AI 方案",
          "ctaHref": "/contact",
          "ctaLabel": "预约免费咨询"
        }
      }
    ]
  },
  {
    "pageKey": "ai-geo-aeo",
    "title": "AI 搜索增长",
    "seo": {},
    "blocks": [
      {
        "id": "ai-geo-content",
        "type": "richText",
        "enabled": true,
        "order": 10,
        "props": {
          "servicePillars": [
            {
              "number": "01",
              "title": "目标问句与增长指标",
              "summary": "锁定客户在采购、比较与了解服务时会问的问题，把曝光、引用与推荐机会转成可复测的目标。",
              "deliverables": [
                "高价值问句与意图清单",
                "出现、引用与推荐机会基线",
                "周期目标与首轮行动优先级"
              ]
            },
            {
              "number": "02",
              "title": "企业事实与推荐证据",
              "summary": "把企业名称、服务、产品、案例、资质和行业经验整理为 AI 能理解、客户能核验的推荐依据。",
              "deliverables": [
                "企业实体与事实资料表",
                "产品、案例与行业关联证据",
                "公开来源与事实冲突修正"
              ]
            },
            {
              "number": "03",
              "title": "官网与推荐内容运营",
              "summary": "持续优化服务、行业、案例和 FAQ，让客户要比较的信息在官网与内容中有清晰、可引用的答案。",
              "deliverables": [
                "服务、行业、案例与 FAQ 优化",
                "页面结构、内链与摘要优化",
                "结构化信息与索引入口检查"
              ]
            },
            {
              "number": "04",
              "title": "可信信源与内容分发",
              "summary": "围绕目标问句持续建设可信来源与内容证据，扩大品牌被 AI 理解、引用和比较的有效信号。",
              "deliverables": [
                "信源与内容机会清单",
                "来源质量和公开授权检查",
                "分发优先级与发布计划"
              ]
            },
            {
              "number": "05",
              "title": "持续代运营与结果复盘",
              "summary": "按约定周期复测、调整和复盘，让每一轮优化都围绕目标问句的可见性与咨询机会继续推进。",
              "deliverables": [
                "周期复测与推荐证据索引",
                "页面与内容变更记录",
                "阶段结果报告与下一周期计划"
              ]
            }
          ],
          "deliveryRows": [
            [
              "目标问句与指标方案",
              "把高价值提问、目标平台与观察口径确定为代运营目标。",
              "问句清单、抽样条件、基线记录与阶段指标。"
            ],
            [
              "企业事实与推荐证据包",
              "让品牌、产品、服务和案例成为可理解、可比较的推荐依据。",
              "事实表、来源清单、授权与冲突核对记录。"
            ],
            [
              "官网与内容运营包",
              "持续补齐客户比较和 AI 理解需要的服务、行业、案例与 FAQ 信息。",
              "页面优化稿、内容计划、结构化与内链检查。"
            ],
            [
              "周期结果与优化报告",
              "复盘目标问句中的出现、引用、推荐机会与后续增长动作。",
              "带时间戳的复测记录、证据索引、变更清单与下周期计划。"
            ]
          ],
          "customerQuestions": [
            "做企业 AI 定制开发，哪些服务商更适合制造和外贸企业？",
            "向 AI 提问：这家公司的 AI 能力、行业经验和真实案例可靠吗？",
            "如何比较几家跨境物流 AI 解决方案供应商？",
            "企业官网为什么有内容，却不容易被 AI 搜索、AI 问答答案引用或推荐？"
          ],
          "journey": [
            [
              "锁定问句",
              "从采购、选型与业务场景中确定高价值目标问题"
            ],
            [
              "建立基线",
              "记录品牌、竞品、引用来源与推荐机会"
            ],
            [
              "持续运营",
              "优化官网、事实、内容、信源与技术入口"
            ],
            [
              "证据验收",
              "在约定条件下复测并留存可追溯记录"
            ],
            [
              "推动增长",
              "根据结果继续优化下一周期优先级"
            ]
          ],
          "homeBreadcrumbName": "首页",
          "solutionsBreadcrumbName": "解决方案",
          "breadcrumbAriaLabel": "面包屑",
          "homeHref": "/",
          "homeLabel": "首页",
          "solutionsHref": "/solutions",
          "solutionsLabel": "解决方案",
          "breadcrumbLabel": "AI 搜索与答案推荐",
          "heroEyebrow": "企业 AI 搜索与答案推荐代运营 · GEO / AEO",
          "titlePrimary": "让品牌进入",
          "titleSecondary": "AI 搜索与答案推荐",
          "heroDescription": "围绕目标客户在 AI 搜索、AI 提问与供应商比较时的高价值问题，持续提升品牌、产品与服务在 AI 问答答案中的曝光、引用与推荐机会，并以可监控、可审计、可追溯的证据交付结果。",
          "primaryHref": "/contact?service=ai-geo-aeo",
          "primaryLabel": "申请 AI 搜索增长代运营评估",
          "secondaryHref": "#deliverables",
          "secondaryLabel": "查看可交付服务",
          "introEyebrow": "AI 搜索与 AI 问答的结果代运营",
          "introTitle": "把 AI 搜索与问答答案变成增长入口",
          "introDescription": "客户会在 AI 搜索中找服务商，也会通过 AI 提问、AI 问答答案比较和验证供应商。我们以代运营方式持续建设品牌事实、内容与可信信号，推动品牌在目标答案中被发现、引用、推荐，并进入客户的比较和咨询环节。",
          "principles": [
            [
              "锁定目标问句",
              "覆盖 AI 搜索、提问、比较与咨询场景"
            ],
            [
              "建设推荐依据",
              "让产品、案例和行业经验可被理解"
            ],
            [
              "持续运营优化",
              "围绕曝光、引用与推荐机会推进"
            ],
            [
              "证据化结果验收",
              "每轮保留时间戳、来源与变更记录"
            ]
          ],
          "pillarsEyebrow": "企业 AI 搜索与答案推荐代运营服务",
          "pillarsTitle": "围绕 AI 搜索、问答引用与推荐持续代运营",
          "pillarsDescription": "从 AI 搜索和 AI 问答的目标问句与基线开始，到内容运营、信源建设与周期复盘，每个阶段都对应增长目标、运营动作和可验收的证据记录。",
          "journeyEyebrow": "方法与验证",
          "journeyTitle": "从目标问句到结果证据的代运营闭环",
          "journeyDescription": "每次复测都会固定问句、平台、地区、语言和时间等条件。只有在可比条件下，变化才有解释价值。",
          "deliverablesEyebrow": "目标、动作与证据同时交付",
          "deliverablesTitle": "每一轮代运营如何验收",
          "deliverablesCaption": "以结果记录与证据包作为交付依据",
          "deliveryColumnLabel": "代运营交付",
          "outcomeColumnLabel": "目标结果",
          "evidenceColumnLabel": "证据验收",
          "questionsEyebrow": "AI 搜索、AI 提问与客户决策场景",
          "questionsTitle": "客户会如何搜索、提问与比较",
          "questionsDescription": "我们不堆砌关键词，而是围绕客户在 AI 搜索、AI 提问、采购比较、验证与咨询环节的自然问题，建设企业真正需要回答的信息。",
          "resultsEyebrow": "结果可监控、可审计、可追溯",
          "resultsTitle": "用统一口径验收增长结果",
          "outcomeTitle": "目标结果",
          "outcomeDescription": "围绕目标问句观察 AI 搜索曝光、AI 问答答案中的品牌出现、信息正确性、引用来源、推荐机会、访问与咨询等增长变化。",
          "operationsTitle": "持续代运营",
          "operationsDescription": "按周期完成问句诊断、官网与内容优化、信源建设、复测复盘与下一轮增长动作。",
          "evidenceTitle": "证据化验收",
          "evidenceDescription": "固定问句、平台、地区、语言和时间条件，交付带时间戳的答案记录、引用来源、变更清单与阶段报告。",
          "faqEyebrow": "目标、过程与验收口径",
          "faqTitle": "先把代运营怎么做、怎么验收讲清楚",
          "ctaEyebrow": "从目标问句开始，持续走向增长结果",
          "ctaTitle": "让品牌进入客户的 AI 搜索与答案推荐",
          "ctaDescription": "提供官网、核心服务与目标客户问题。我们先完成代运营评估，明确品牌在 AI 搜索和 AI 问答答案中的当前机会、目标问句、增长指标与首轮行动计划。",
          "ctaHref": "/contact?service=ai-geo-aeo",
          "ctaLabel": "申请 AI 搜索增长代运营评估"
        }
      }
    ]
  },
  {
    "pageKey": "solution-detail",
    "title": "行业方案详情模板",
    "seo": {},
    "blocks": [
      {
        "id": "solution-detail-copy",
        "type": "richText",
        "enabled": true,
        "order": 10,
        "props": {
          "homeBreadcrumbName": "首页",
          "solutionsBreadcrumbName": "解决方案",
          "homeHref": "/",
          "homeLabel": "首页",
          "solutionsHref": "/solutions",
          "solutionsLabel": "解决方案",
          "painPointsTitle": "行业痛点",
          "solutionTitle": "寰引解决方案",
          "servicePackagesTitle": "我们提供什么",
          "servicePackagesDescription": "从一次基线诊断开始，把客户问题、公开信息和可验证的交付物连接起来。",
          "processTitle": "项目如何推进",
          "deliveryTitle": "交付什么，如何验收",
          "deliverablesTitle": "交付物",
          "measurementTitle": "可观察指标",
          "boundariesTitle": "哪些结果不能保证",
          "relatedCasesTitle": "关联案例",
          "faqTitle": "常见问题",
          "geoCtaTitle": "先从一次可验证的基线诊断开始",
          "ctaTitle": "想了解更多？",
          "geoCtaDescription": "提供你的官网、主要服务和目标客户问题，我们先确认 AI 搜索增长是否适合当前阶段。",
          "ctaDescription": "告诉我们你的业务场景，我们给出可落地的 AI 方案",
          "geoCtaLabel": "申请 AI 搜索可见性诊断",
          "ctaLabel": "预约免费咨询",
          "geoCtaHref": "/contact?service=ai-geo-aeo",
          "ctaHref": "/contact"
        }
      }
    ]
  },
  {
    "pageKey": "blog-detail",
    "title": "文章详情模板",
    "seo": {},
    "blocks": [
      {
        "id": "blog-detail-copy",
        "type": "richText",
        "enabled": true,
        "order": 10,
        "props": {
          "homeHref": "/",
          "homeLabel": "首页",
          "blogHref": "/blog",
          "blogLabel": "博客",
          "authorPrefix": "作者：",
          "sourcesTitle": "资料来源与内容审核",
          "sourceAccessedPrefix": "（访问：",
          "reviewStatusPrefix": "内容状态：",
          "pendingReviewLabel": "待审核",
          "ctaTitle": "想了解更多 AI 落地方案？",
          "ctaDescription": "告诉我们你的业务场景，我们给出可落地的 AI 方案",
          "ctaLabel": "预约免费咨询",
          "relatedPostsTitle": "继续阅读",
          "readMoreLabel": "阅读全文",
          "reviewedLabel": "已审核"
        }
      }
    ]
  },
  {
    "pageKey": "case-detail",
    "title": "案例详情模板",
    "seo": {},
    "blocks": [
      {
        "id": "case-detail-copy",
        "type": "richText",
        "enabled": true,
        "order": 10,
        "props": {
          "homeHref": "/",
          "homeLabel": "首页",
          "casesHref": "/cases",
          "casesLabel": "案例",
          "relatedCustomersPrefix": "关联客户：",
          "painPointsTitle": "客户痛点",
          "solutionTitle": "解决方案",
          "customerValueTitle": "客户价值",
          "metricsTitle": "数据指标",
          "scenariosTitle": "适用场景",
          "ctaTitle": "你的企业也有类似需求？",
          "ctaDescription": "告诉我们你的业务场景，我们给出可落地的 AI 方案",
          "ctaHref": "/contact",
          "ctaLabel": "预约免费咨询"
        }
      }
    ]
  },
  {
    "pageKey": "site-chrome",
    "title": "全站导航与页脚",
    "seo": {},
    "blocks": [
      {
        "id": "site-navbar",
        "type": "cta",
        "enabled": true,
        "order": 10,
        "props": {
          "homeHref": "/",
          "desktopCtaHref": "/contact",
          "desktopCtaLabel": "预约咨询",
          "menuAriaLabel": "切换菜单",
          "mobileCtaHref": "/contact",
          "mobileCtaLabel": "预约咨询"
        }
      },
      {
        "id": "site-footer",
        "type": "richText",
        "enabled": true,
        "order": 20,
        "props": {
          "solutionsTitle": "解决方案",
          "solutionsHref": "/solutions",
          "solutionsAllLabel": "查看全部",
          "casesTitle": "客户案例",
          "casesHref": "/cases",
          "casesAllLabel": "查看全部",
          "contactsTitle": "联系我们",
          "emailLabel": "邮箱",
          "wechatLabel": "微信"
        }
      }
    ]
  }
];
