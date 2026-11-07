type MydoLogoProps = {
    className?: string;
    label?: string;
};

export default function MydoLogo({
    className = 'h-10 w-10',
    label = 'Municipal Youth Development Office',
}: MydoLogoProps) {
    return (
        <img
            src="/images/mydo.png"
            alt={label}
            className={`shrink-0 object-contain ${className}`}
        />
    );
}
