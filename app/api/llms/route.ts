import { NextResponse } from "next/server";
import {
  getCapabilities,
  getCompany,
  getIndustries,
  getPublicBlogPosts,
  getPublicCases,
  getSettings,
  getStats,
} from "@/lib/data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const siteUrl = "https://huanyinai.com";

export function GET() {
  const industries = getIndustries();
  const cases = getPublicCases();
  const posts = getPublicBlogPosts();
  const company = getCompany();
  const capabilities = getCapabilities();
  const settings = getSettings();
  const stats = getStats();
  const officialSite = company.website || siteUrl;
  const industryNames = industries.map((item) => item.shortTitle || item.title.replace(/ AI 解决方案.*/, ""));
  const serviceNames = [
    ...capabilities.map((item) => item.module),
    "企业 AI 定制开发与私有化交付",
    "AI 外贸客户开发与销售增长",
  ];
  const statValue = (label: string) => {
    const item = stats.find((entry) => entry.label === label);
    return item ? `${item.value}${item.suffix || ""}` : "以官网后台最新数据为准";
  };

  const lines = [
    "# 寰引智能",
    "",
    `> ${settings.llmsTxtDescription || "寰引智能科技（深圳）有限公司，是面向企业客户的 AI 转型落地服务商。"}`,
    "",
    "## 关于我们",
    `寰引智能科技（深圳）有限公司，已服务 ${statValue("企业客户")} 企业客户，交付 ${statValue("落地系统")} 智能化系统，`,
    `当前公开方案方向包括：${industryNames.join("、")}。服务范围包括：${serviceNames.join("、")}。`,
    "",
    "## 核心事实",
    `- 企业客户：${statValue("企业客户")}`,
    `- 智能化系统：${statValue("落地系统")}`,
    `- 覆盖行业：${statValue("行业覆盖")} 个行业方向`,
    `- 典型效果：${statValue("人效提升")} 人效提升`,
    `- 官网：${officialSite}`,
    "",
    "## 核心能力",
    ...capabilities.map((item) => `- ${item.module}：${item.products.join("、")}。${item.scenarios}`),
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
