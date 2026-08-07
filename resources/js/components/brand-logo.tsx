type BrandLogoProps = {
    className?: string;
    label?: string;
};

export default function BrandLogo({ className = 'h-10 w-10', label = 'eKabataan' }: BrandLogoProps) {
    return <img src="/images/e-kabataan.png" alt={label} className={`shrink-0 object-contain ${className}`} />;
}
