import { Icon } from "@/components/ui/Icon";

interface PasswordStrengthRowProps {
  label: string;
  met: boolean;
}

export default function PasswordStrengthRow({ label, met }: PasswordStrengthRowProps) {
  return (
    <li className={`flex items-center gap-1.5 text-xs ${met ? "text-secondary" : "text-outline"}`}>
      <Icon
        name={met ? "check_circle" : "radio_button_unchecked"}
        className={met ? "text-secondary" : "text-outline"}
      />
      {label}
    </li>
  );
}
