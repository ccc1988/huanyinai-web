import { customers } from "@/lib/data";
import { getCustomerIcon } from "@/lib/customerIcons";

export default function ClientLogos() {
  return (
    <section className="py-20" style={{ backgroundColor: "var(--color-bg-base)" }}>
      <div className="container-max">
        <p
          className="text-center text-sm mb-12"
          style={{ color: "var(--color-text-muted)" }}
        >
          值得信赖的 AI 转型合作伙伴
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6">
          {customers.map((customer) => {
            const { icon: Icon, color } = getCustomerIcon(customer.name);
            return (
              <div
                key={customer.name}
                className="glass-card rounded-[var(--radius-md)] p-6 flex flex-col items-center justify-center gap-3 transition-all duration-200 cursor-pointer group"
              >
                {/* Icon circle */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                  style={{
                    backgroundColor: `${color}1A`,
                    border: `1px solid ${color}30`,
                  }}
                >
                  <Icon size={24} style={{ color }} />
                </div>
                {/* Name */}
                <span
                  className="text-sm font-medium text-center transition-colors duration-200 group-hover:text-[var(--color-text-primary)]"
                  style={{ color: "var(--color-text-logo)" }}
                >
                  {customer.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
