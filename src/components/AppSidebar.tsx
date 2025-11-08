type NavItem = {
	label: string;
	children?: { label: string }[];
};

const NAV: NavItem[] = [
	{
		label: "Create",
		children: [{ label: "New Ad" }, { label: "Storyboard" }, { label: "Scenes" }],
	},
	{
		label: "Ads",
		children: [{ label: "All" }, { label: "Drafts" }],
	},
	{
		label: "Library",
		children: [{ label: "Assets" }],
	},
];

export const AppSidebar = () => {
	return (
		<aside className="h-full w-60 border-r border-border bg-card/40">
			<div className="h-full flex flex-col">
				<div className="px-4 py-4 border-b border-border flex items-center gap-2">
					<div className="h-8 w-8 rounded-md border border-border bg-background flex items-center justify-center overflow-hidden">
						<img
							src="/adgentlogo.png"
							alt="Adgent logo"
							className="h-6 w-6 object-cover"
						/>
					</div>
					<span className="text-sm font-semibold text-foreground">Adgent</span>
				</div>

				<nav className="flex-1 overflow-y-auto px-2 py-3">
					{NAV.map((section) => (
						<div key={section.label} className="mb-4">
							<div className="px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
								{section.label}
							</div>
							<div className="mt-1 space-y-1">
								{section.children?.map((item) => (
									<button
										key={item.label}
										type="button"
										className="w-full text-left px-3 py-2 rounded-md text-sm text-foreground/90 hover:bg-accent hover:text-foreground transition-colors flex items-center gap-2"
										onClick={(e) => {
											e.preventDefault();
										}}
										aria-disabled
									>
										<span className="h-4 w-4 text-muted-foreground">
											{getIconFor(item.label)}
										</span>
										{item.label}
									</button>
								))}
							</div>
						</div>
					))}
				</nav>
			</div>
		</aside>
	);
};

function getIconFor(label: string) {
	switch (label) {
		case "New Ad":
			return (
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
					<path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
				</svg>
			);
		case "Storyboard":
			return (
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
					<rect x="3" y="4" width="7" height="7" rx="1" />
					<rect x="14" y="4" width="7" height="7" rx="1" />
					<rect x="3" y="13" width="7" height="7" rx="1" />
					<rect x="14" y="13" width="7" height="7" rx="1" />
				</svg>
			);
		case "Scenes":
			return (
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
					<rect x="3" y="5" width="14" height="14" rx="2" />
					<path d="M21 7l-4 2v6l4 2V7z" />
				</svg>
			);
		case "All":
			return (
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
					<path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" />
				</svg>
			);
		case "Drafts":
			return (
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
					<path d="M4 4h10l6 6v10a0 0 0 0 1 0 0H4a0 0 0 0 1 0 0z" />
					<path d="M14 4v6h6" />
				</svg>
			);
		case "Assets":
			return (
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
					<path d="M4 7h16M4 17h16" />
					<rect x="4" y="7" width="16" height="10" rx="2" />
				</svg>
			);
		default:
			return (
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
					<circle cx="12" cy="12" r="4" />
				</svg>
			);
	}
}


