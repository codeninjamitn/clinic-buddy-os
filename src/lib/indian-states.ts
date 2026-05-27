export const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana",
  "Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur",
  "Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Andaman and Nicobar Islands","Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu","Delhi","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry",
];

export function generatePassword(len = 12) {
  const lower = "abcdefghijkmnpqrstuvwxyz";
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const digits = "23456789";
  const sym = "@#$%&!";
  const all = lower + upper + digits + sym;
  const pick = (s: string) => s[Math.floor(Math.random() * s.length)];
  let pw = pick(upper) + pick(lower) + pick(digits) + pick(sym);
  for (let i = 4; i < len; i++) pw += pick(all);
  return pw.split("").sort(() => Math.random() - 0.5).join("");
}

export function passwordStrength(pw: string): { score: 0|1|2|3; label: string; color: string } {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) s++;
  if (s === 0) return { score: 0, label: "Too short", color: "#E05C5C" };
  if (s === 1) return { score: 1, label: "Weak", color: "#E05C5C" };
  if (s === 2) return { score: 2, label: "Medium", color: "#F59E0B" };
  return { score: 3, label: "Strong", color: "#02C39A" };
}
