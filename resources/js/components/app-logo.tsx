import BrandLogo from './brand-logo';

export default function AppLogo() {
    return (
        <>
            <BrandLogo className="h-9 w-9" />
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-none font-semibold">eKabataan</span>
            </div>
        </>
    );
}
