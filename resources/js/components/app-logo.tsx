import BrandLogo from './brand-logo';
import MydoLogo from './mydo-logo';

export default function AppLogo() {
    return (
        <div className="flex items-center gap-2 overflow-hidden">
            <div className="flex items-center gap-1.5 shrink-0">
                <MydoLogo className="h-7 w-7 rounded-full bg-white p-0.5 shadow-2xs" />
                <div className="h-4 w-px bg-neutral-300 dark:bg-neutral-700" />
                <BrandLogo className="h-6 w-6" />
            </div>
            <div className="grid flex-1 text-left text-xs leading-tight min-w-0">
                <span className="truncate font-bold tracking-tight text-neutral-900 dark:text-white">eKabataan</span>
                <span className="truncate text-[10px] text-neutral-500 dark:text-neutral-400">MYDO Portal</span>
            </div>
        </div>
    );
}
