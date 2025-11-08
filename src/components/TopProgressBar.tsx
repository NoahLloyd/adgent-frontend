import { useMemo } from "react";

type TopProgressBarProps = {
	steps: string[];
	activeIndex: number; // 0-based
};

export const TopProgressBar = ({ steps, activeIndex }: TopProgressBarProps) => {
	const clampedIndex = Math.max(0, Math.min(activeIndex, steps.length - 1));
	const percent = useMemo(() => {
		if (steps.length <= 1) return 0;
		return (clampedIndex / (steps.length - 1)) * 100;
	}, [clampedIndex, steps.length]);

	return (
		<div className="w-full border-b border-border bg-background">
			<div className="max-w-5xl mx-auto px-6 pt-10 pb-6">
				<div className="relative w-[92%] mx-auto">
					{/* Track */}
					<div className="h-1 w-full rounded-full bg-muted absolute top-1/2 left-0 -translate-y-1/2" />
					{/* Filled */}
					<div
						className="h-1 rounded-full bg-primary absolute top-1/2 left-0 -translate-y-1/2 transition-[width] duration-500 ease-out"
						style={{ width: `${percent}%` }}
					/>
					{/* Steps: dots centered on the line, labels above using absolute positioning */}
					<div className="absolute inset-0">
						{steps.map((label, idx) => {
							const leftPercent =
								steps.length <= 1 ? 0 : (idx / (steps.length - 1)) * 100;
							const isActive = idx <= clampedIndex;
							return (
								<div
									key={label}
									className="absolute"
									style={{ left: `${leftPercent}%`, top: "50%" }}
								>
									{/* Dot centered on the line */}
									<div
										className={[
											"absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-3 w-3 rounded-full border",
											isActive
												? "bg-primary border-primary"
												: "bg-background border-muted-foreground/40",
										].join(" ")}
									/>
									{/* Label above the dot */}
									<span
										className="absolute text-[10px] leading-none text-muted-foreground"
										style={{
											left: "50%",
											top: 0,
											transform: "translate(-50%, -100%) translateY(-8px)",
											whiteSpace: "nowrap",
										}}
									>
										{label}
									</span>
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
};


