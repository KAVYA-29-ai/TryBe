import { Outlet, Link, useLocation } from 'react-router-dom';

export default function Layout() {
  const location = useLocation();

  const getNavClass = (path: string) => {
    const isActive = location.pathname.startsWith(path);
    if (isActive) {
      return "flex items-center gap-md px-md py-sm rounded-lg text-primary font-bold border-r-4 border-primary bg-secondary-container/10 hover:bg-surface-container-high transition-colors duration-200 scale-95 active:scale-90 transition-transform";
    }
    return "flex items-center gap-md px-md py-sm rounded-lg text-on-surface-variant font-medium hover:bg-surface-container-high transition-colors duration-200 scale-95 active:scale-90 transition-transform";
  };

  const getIconFill = (path: string) => {
    return location.pathname.startsWith(path) ? "1" : "0";
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex selection:bg-primary-container selection:text-on-primary-container">
      {/* SideNavBar */}
      <nav className="fixed left-0 top-0 h-screen w-64 border-r border-outline-variant bg-surface-container-lowest hidden md:flex flex-col py-lg px-md z-50">
        {/* Header */}
        <div className="px-md mb-xl">
          <h1 className="text-headline-xl font-bold text-primary tracking-tighter uppercase">TRYBEE</h1>
          <p className="font-label-sm text-label-sm text-on-surface-variant">Campus Discovery</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex-1 flex flex-col gap-sm overflow-y-auto">
          <Link className={getNavClass('/home')} to="/home">
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: `"FILL" ${getIconFill('/home')}` }}>grid_view</span>
            <span className="font-label-md text-label-md">Home</span>
          </Link>
          <Link className={getNavClass('/discover')} to="/discover">
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: `"FILL" ${getIconFill('/discover')}` }}>search</span>
            <span className="font-label-md text-label-md">Discover</span>
          </Link>
          <Link className={getNavClass('/college')} to="/college">
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: `"FILL" ${getIconFill('/college')}` }}>apartment</span>
            <span className="font-label-md text-label-md">My College</span>
          </Link>
          <Link className={getNavClass('/clubs')} to="/clubs">
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: `"FILL" ${getIconFill('/clubs')}` }}>hub</span>
            <span className="font-label-md text-label-md">Clubs</span>
          </Link>
          <Link className={getNavClass('/work')} to="/work">
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: `"FILL" ${getIconFill('/work')}` }}>work</span>
            <span className="font-label-md text-label-md">Work</span>
          </Link>
        </div>

        {/* CTA */}
        <div className="mt-xl px-xs">
          <Link to="/home#create-post" className="w-full py-sm rounded-full bg-primary-container text-on-primary-container font-label-md text-label-md hover:bg-secondary-container transition-colors shadow-[0_0_20px_rgba(125,64,71,0.4)] flex justify-center items-center">
            Create Post
          </Link>
        </div>

        {/* Footer Tabs */}
        <div className="mt-lg flex flex-col gap-xs border-t border-outline-variant pt-sm">
          <Link className={getNavClass('/profile')} to="/profile">
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: `"FILL" ${getIconFill('/profile')}` }}>account_circle</span>
            <span className="font-label-md text-label-md">Profile</span>
          </Link>
          <Link className={getNavClass('/settings')} to="/settings">
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: `"FILL" ${getIconFill('/settings')}` }}>settings</span>
            <span className="font-label-md text-label-md">Settings</span>
          </Link>
          <Link className={getNavClass('/help')} to="/help">
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: `"FILL" ${getIconFill('/help')}` }}>help_outline</span>
            <span className="font-label-md text-label-md">Help</span>
          </Link>
        </div>
      </nav>

      {/* TopNavBar (Mobile) */}
      <header className="md:hidden fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant flex justify-between items-center h-16 px-margin-mobile">
        <div className="font-headline-md text-headline-md font-black tracking-tighter text-primary">TRYBEE</div>
        <div className="flex items-center gap-md">
          <span className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors duration-200">notifications</span>
          <span className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors duration-200">chat_bubble</span>
          <img alt="User avatar" className="w-8 h-8 rounded-full border border-outline-variant" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgjJ2Ow2gO4Q24pHYT4YVD8fa0Whh-yzgJ5hV_54u9HEUhRabcfjmSHEfRgsjUWm_fEs2bqmrT1hEgIAds5Gyt740OKcl9DQFNPQVNglHr2tT0Y9Nquq7taH-vM8q9HodaUSpSFKZCD6hevrZIXNgbKaK7Kvt0NcBDR-j2gKPeBAmviDFusUHnATUm9WjPCZMesHIB9e3N418zC9IDu2RByR6nHoI_KCKbZTBkfkPxuT98Ds_D31SY" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 pt-16 md:pt-0 min-h-screen bg-background relative overflow-hidden">
        {/* Ambient Background Glow */}
        <div className="absolute top-0 left-1/4 w-[800px] h-[400px] bg-primary-container/5 rounded-full blur-[120px] pointer-events-none z-0"></div>
        <div className="relative z-10 w-full h-full flex flex-col">
          <Outlet />
        </div>
      </main>

      {/* BottomNavBar (Mobile) */}
      <nav className="md:hidden fixed bottom-0 w-full bg-surface/80 backdrop-blur-xl border-t border-outline-variant z-50 px-margin-mobile py-sm flex justify-around items-center">
        <Link className="flex flex-col items-center gap-base text-on-surface-variant hover:text-primary transition-colors" to="/home">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: `"FILL" ${getIconFill('/home')}` }}>home</span>
        </Link>
        <Link className="flex flex-col items-center gap-base text-on-surface-variant hover:text-primary transition-colors" to="/discover">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: `"FILL" ${getIconFill('/discover')}` }}>explore</span>
        </Link>
        <Link className="flex flex-col items-center gap-base text-on-surface-variant hover:text-primary transition-colors" to="/college">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: `"FILL" ${getIconFill('/college')}` }}>school</span>
        </Link>
        <Link className="flex flex-col items-center gap-base text-on-surface-variant hover:text-primary transition-colors" to="/clubs">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: `"FILL" ${getIconFill('/clubs')}` }}>groups</span>
        </Link>
        <Link className="flex flex-col items-center gap-base text-on-surface-variant hover:text-primary transition-colors" to="/profile">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: `"FILL" ${getIconFill('/profile')}` }}>person</span>
        </Link>
      </nav>
    </div>
  );
}
