import { Outlet } from "react-router-dom";
import { BadgeCheck, PhoneCall, ShieldCheck } from "lucide-react";
import { Logo } from "../components/layout/Brand";
import { StyleToggle } from "../store/StyleContext";
import { CarArt } from "../components/vehicle/CarArt";

export default function AuthLayout() {
  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-[1fr_minmax(440px,0.9fr)]">
      <div
        className="flex flex-col py-6"
        style={{
          paddingLeft: "max(20px, env(safe-area-inset-left, 0px))",
          paddingRight: "max(20px, env(safe-area-inset-right, 0px))",
        }}
      >
        <div className="flex items-center justify-between">
          <Logo />
          <StyleToggle />
        </div>
        <div className="mx-auto flex w-full max-w-[520px] flex-1 flex-col justify-center py-10">
          <Outlet />
        </div>
        <p className="text-center text-xs text-mist-500">
          Demo build — sign-in, OTP and payments are simulated.
        </p>
      </div>
      {/* <aside className="relative hidden overflow-hidden bg-ink-950 lg:flex lg:flex-col lg:justify-between" style={{ paddingRight: 'env(safe-area-inset-right, 0px)' }}>
        <div className="px-12 pt-16">
          <p className="eyebrow text-accent-300">For dealers, owners and agents</p>
          <h2 className="mt-3 max-w-md text-[34px] font-bold leading-[1.1] text-white">Publish in minutes. Get calls from real buyers.</h2>
          <ul className="mt-8 space-y-4 text-[15px] text-ink-200">
            <li className="flex gap-3">
              <PhoneCall className="mt-0.5 h-5 w-5 shrink-0 text-accent-300" />
              Buyers call or message you directly. No commission on the sale.
            </li>
            <li className="flex gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-accent-300" />
              Duplicate registration numbers and VINs are blocked automatically.
            </li>
            <li className="flex gap-3">
              <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-accent-300" />
              Verified-document badge once our team reviews your papers.
            </li>
          </ul>
        </div>
        <div className="relative">
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-accent-900/30 to-transparent" />
          <CarArt vehicle={{ bodyType: 'SUV', colorHex: '#E8201C' }} view="rear" className="aspect-[16/9] w-full" bare />
        </div>
      </aside> */}

      <aside className="relative hidden min-h-screen overflow-hidden bg-[#10191C] lg:flex lg:flex-col lg:justify-between">
        {/* Real automotive background image */}
        <img
          src="https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1800&q=90"
          alt="Premium SUV in a dramatic automotive setting"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        {/* Cinematic overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#071114]/90 via-[#071114]/45 to-[#071114]/95" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#071114]/40 to-transparent" />

        {/* Marketing content */}
        <div className="relative z-10 px-10 pt-16 xl:px-14 xl:pt-20">
          <p className="eyebrow text-accent-300">
            For dealers, owners and agents
          </p>

          <h2 className="mt-4 max-w-lg text-4xl font-extrabold leading-tight tracking-tight text-white xl:text-5xl">
            Your next sale starts with{" "}
            <span className="text-[#F8D000]">the right buyer.</span>
          </h2>

          <p className="mt-5 max-w-md text-base leading-7 text-white/75">
            List your vehicles, connect directly with interested buyers, and
            grow your automotive business.
          </p>

          <ul className="mt-9 space-y-5 text-sm leading-6 text-white/90">
            <li className="flex items-start gap-3">
              <PhoneCall className="mt-0.5 h-5 w-5 shrink-0 text-[#F8D000]" />
              <span>
                <strong className="block text-white">
                  Direct buyer contact
                </strong>
                Buyers call or message you directly, with no commission on the
                sale.
              </span>
            </li>

            <li className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#F8D000]" />
              <span>
                <strong className="block text-white">Safer listings</strong>
                Duplicate registration numbers and VINs are blocked
                automatically.
              </span>
            </li>

            <li className="flex items-start gap-3">
              <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#F8D000]" />
              <span>
                <strong className="block text-white">
                  Document verification
                </strong>
                Earn a verified-document badge after your documents are
                reviewed.
              </span>
            </li>
          </ul>
        </div>

        {/* Bottom image caption */}
        <div className="relative z-10 mx-10 mb-10 rounded-2xl border border-white/20 bg-black/25 p-5 backdrop-blur-md xl:mx-14">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#F8D000]">
            Built for smarter car trading
          </p>
          <p className="mt-2 text-sm text-white/80">
            Discover vehicles. Meet buyers. Make the connection.
          </p>
        </div>
      </aside>
    </div>
  );
}
