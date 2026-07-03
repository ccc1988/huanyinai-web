import { customers } from "@/lib/data";

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

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 md:gap-8">
          {customers.map((customer) => (
            <div
              key={customer.name}
              className="flex items-center justify-center py-4 px-2"
            >
              <span
                className="text-sm md:text-base font-medium text-center transition-colors duration-200 hover:text-[var(--color-text-body)] cursor-default"
                style={{ color: "var(--color-text-logo)" }}
              >
                {customer.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
