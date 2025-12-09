import logoImage from '../assets/logo.png';

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img src={logoImage} alt="NYC Live Events Logo" className="h-12 w-auto" style={{ transform: 'scale(1.5)' }} />
    </div>
  );
}
