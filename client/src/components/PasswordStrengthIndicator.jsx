import { validatePassword, getPasswordStrengthColor, getPasswordStrengthBgColor } from "@/lib/passwordValidator";

export default function PasswordStrengthIndicator({ password }) {
  const { strength, errors, score } = validatePassword(password);
  const colorClass = getPasswordStrengthColor(strength);
  const bgColorClass = getPasswordStrengthBgColor(strength);

  if (!password) return null;

  return (
    <div className={`mt-2 p-3 rounded-md ${bgColorClass}`}>
      <div className="flex items-center gap-2 mb-2">
        <div className="flex gap-1">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-1 w-6 rounded-full transition-colors ${
                i <= score
                  ? strength === "strong"
                    ? "bg-green-600"
                    : strength === "medium"
                      ? "bg-yellow-600"
                      : "bg-red-600"
                  : "bg-gray-300"
              }`}
            />
          ))}
        </div>
        <span className={`text-xs font-semibold ${colorClass}`}>
          {strength.charAt(0).toUpperCase() + strength.slice(1)} Password
        </span>
      </div>

      {errors.length > 0 && (
        <div className="space-y-1">
          {errors.map((error, index) => (
            <div key={index} className="text-xs text-gray-700 flex items-center gap-2">
              <span className="text-red-600">✗</span>
              {error}
            </div>
          ))}
        </div>
      )}

      {errors.length === 0 && (
        <div className="text-xs text-green-700">✓ Password meets security requirements</div>
      )}
    </div>
  );
}
