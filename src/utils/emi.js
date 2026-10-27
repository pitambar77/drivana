/**
 * Standard reducing-balance EMI.
 * EMI = P·r·(1+r)^n / ((1+r)^n − 1), r = monthly rate, n = months.
 * Returns an estimate only — not a loan offer.
 */
export function calcEmi({ price, downPayment = 0, ratePct, months }) {
  const principal = Math.max(0, Number(price) - Number(downPayment));
  const n = Math.max(1, Math.round(Number(months) || 1));
  const r = Number(ratePct) / 12 / 100;
  const emi = r === 0 ? principal / n : (principal * r * (1 + r) ** n) / ((1 + r) ** n - 1);
  const total = emi * n;
  return {
    principal,
    emi: Math.round(emi),
    totalPayable: Math.round(total),
    totalInterest: Math.round(total - principal),
    months: n,
  };
}

/** Year-by-year outstanding balance, used by the amortisation chart. */
export function amortisation({ price, downPayment = 0, ratePct, months }) {
  const { principal, emi } = calcEmi({ price, downPayment, ratePct, months });
  const r = Number(ratePct) / 12 / 100;
  let bal = principal;
  let interestPaid = 0;
  const rows = [];
  for (let m = 1; m <= months; m++) {
    const i = bal * r;
    interestPaid += i;
    bal = Math.max(0, bal - (emi - i));
    if (m % 12 === 0 || m === months) {
      rows.push({ label: `Yr ${Math.ceil(m / 12)}`, balance: Math.round(bal), interest: Math.round(interestPaid), principalPaid: Math.round(principal - bal) });
    }
  }
  return rows;
}
