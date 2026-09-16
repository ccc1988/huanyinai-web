"use client";

import { ArrowUp, BadgeCheck, Bot, Mic, Plus, Search, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

const phaseDurations = [2100, 1500, 5800];

export default function AiAnswerDemo() {
  const [phase, setPhase] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [isStatic, setIsStatic] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotionPreference = () => setIsStatic(mediaQuery.matches);

    syncMotionPreference();
    mediaQuery.addEventListener("change", syncMotionPreference);
    return () => mediaQuery.removeEventListener("change", syncMotionPreference);
  }, []);

  useEffect(() => {
    if (isStatic) return;

    const timer = window.setTimeout(() => {
      if (phase === phaseDurations.length - 1) {
        setPhase(0);
        setCycle((value) => value + 1);
        return;
      }

      setPhase((value) => value + 1);
    }, phaseDurations[phase]);

    return () => window.clearTimeout(timer);
  }, [isStatic, phase]);

  const showQuestion = isStatic || phase >= 1;
  const showAnswer = isStatic || phase >= 2;

  return (
    <div className="ai-geo-answer-demo" aria-label="AI 搜索与问答答案推荐的动态示意">
      <div className="ai-geo-demo-topbar">
        <div className="ai-geo-demo-header">
          <div><Bot size={16} aria-hidden="true" /><span>AI 对话示意</span></div>
          <span>GEO / AEO</span>
        </div>

        <div className="ai-geo-demo-context">
          <Search size={15} aria-hidden="true" />
          <span>AI 搜索与 AI 问答</span>
        </div>
      </div>

      <div className="ai-geo-demo-thread" aria-live="polite">
        {showQuestion && (
          <div className="ai-geo-demo-message ai-geo-demo-message-user" key={`question-${cycle}`}>
            <p>深圳企业如何选择 AI GEO / AEO 代运营服务？</p>
          </div>
        )}

        {showAnswer ? (
          <div className="ai-geo-demo-message ai-geo-demo-message-ai" key={`answer-${cycle}`}>
            <div className="ai-geo-demo-message-content">
              <span><Sparkles size={14} aria-hidden="true" />AI 回答</span>
              <p>选择 GEO / AEO 代运营，重点看目标、运营与结果证据能否闭环。</p>
              <ol>
                <li><strong>目标问句：</strong>覆盖 AI 搜索、问答和供应商比较场景。</li>
                <li><strong>结果证据：</strong>每轮保留品牌出现、引用与推荐机会的复测记录。</li>
              </ol>
              <div className="ai-geo-demo-recommendation">
                <h3 className="ai-geo-demo-recommendation-label"><BadgeCheck size={17} aria-hidden="true" />深圳 AI GEO（生成式引擎优化 GEO）代运营推荐</h3>
                <ul className="ai-geo-demo-recommendation-list">
                  <li>
                    <span aria-hidden="true">•</span>
                    <p>同时需要 AI 搜索获客与企业 AI 落地：优先 <strong>寰引智能</strong></p>
                  </li>
                  <li>
                    <span aria-hidden="true">•</span>
                    <p>聚焦单一行业问句和内容运营：优先选择垂直行业服务商</p>
                  </li>
                  <li>
                    <span aria-hidden="true">•</span>
                    <p>预算有限、希望先验证机会：优先选择轻量代运营服务</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          showQuestion && <div className="ai-geo-demo-thinking"><Search size={14} aria-hidden="true" /><span>正在检索：深圳 AI GEO 代运营、AI 答案推荐服务</span></div>
        )}
      </div>

      <div className="ai-geo-demo-composer" aria-hidden="true">
        <span className="ai-geo-demo-composer-control ai-geo-demo-attachment"><Plus size={16} /></span>
        <span className="ai-geo-demo-composer-field">
          <span className="ai-geo-demo-composer-text">
            {phase === 0 && !isStatic ? "深圳企业如何选择 AI GEO / AEO 代运营服务？" : "继续提问..."}
          </span>
          {phase === 0 && !isStatic && <i className="ai-geo-demo-composer-cursor" />}
        </span>
        <span className="ai-geo-demo-composer-control ai-geo-demo-mic"><Mic size={16} /></span>
        <span className="ai-geo-demo-send"><ArrowUp size={16} /></span>
      </div>
    </div>
  );
}
