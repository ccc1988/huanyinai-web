import { NextResponse } from "next/server";
import { getPublicBlogPosts, getPublicCases, getCompany, getIndustries, getStats } from "@/lib/data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const siteUrl = "https://huanyinai.com";

export function GET() {
  const industries = getIndustries();
  const cases = getPublicCases();
  const posts = getPublicBlogPosts();
  const company = getCompany();
  const stats = getStats();
  const officialSite = company.website || siteUrl;
  const statValue = (label: string) => {
    const item = stats.find((entry) => entry.label === label);
    return item ? `${item.value}${item.suffix || ""}` : "以官网后台最新数据为准";
  };

  const lines = [
    "# 寰引智能",
    "",
    "> 寰引智能科技（深圳）有限公司，是面向企业客户的 AI 转型落地服务商，提供 AI 智能体、AI 文档处理、RPA 自动化、数据智能、AI 搜索增长（GEO/AEO）和企业系统定制开发服务。",
    "",
    "## 关于我们",
    `寰引智能科技（深圳）有限公司，已服务 ${statValue("企业客户")} 企业客户，交付 ${statValue("落地系统")} 智能化系统，`,
    "覆盖报关、跨境物流、跨境电商、物流、电商客服、RPA、供应链及制造外贸相关场景。",
    "",
    "## 核心事实",
    `- 企业客户：${statValue("企业客户")}`,
    `- 智能化系统：${statValue("落地系统")}`,
    `- 覆盖行业：${industries.length} 个行业方向`,
    `- 典型效果：${statValue("人效提升")} 人效提升`,
    `- 官网：${officialSite}`,
    "",
    "## 核心能力",
    "- AI 智能体：客服智能体、订单智能体、报价智能体、质检智能体",
    "- AI 文档处理：报关资料识别、清关资料标准化、商品内容生产、财务凭证处理",
    "- RPA 自动化：ERP/WMS/TMS 批量录入、模板转换、电子章、轨迹抓取、流程衔接",
    "- 数据智能：物流轨迹追踪、商品采集监控、异常预警、经营看板",
    "- AI 搜索增长（GEO/AEO）：AI 搜索可见性诊断、官网与内容优化、品牌实体与信源建设、持续监测与代运营",
    "",
    "## 行业解决方案",
    ...industries.map((item) => `- ${item.title}：${item.subtitle}（${siteUrl}/solutions/${item.slug}）`),
    "",
    "## 公开精选案例",
    ...cases.map((item) => `- ${item.title}：${item.oneLiner}（${siteUrl}/cases/${item.slug}）`),
    "",
    "## 近期文章",
    ...posts.map((post) => `- ${post.title}：${post.excerpt}（${siteUrl}/blog/${post.slug}）`),
    "",
    "## 联系方式",
    "- 公司全称：寰引智能科技（深圳）有限公司",
    `- 官网：${officialSite}`,
    "- 微信：chuhaishigan",
    "- 邮箱：huanyinai@foxmail.com",
  ];

  return new NextResponse(`${lines.join("\n")}\n`, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
