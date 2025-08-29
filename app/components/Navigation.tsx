"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
	const pathname = usePathname();

	const navItems = [
		{ href: "/", label: "Home", icon: "🏠" },
		{ href: "/discover", label: "Discover", icon: "🔍" },
		{ href: "/experiences/test", label: "Experience", icon: "🎯" },
	];

	return (
		<nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
			<div className="max-w-4xl mx-auto px-4">
				<div className="flex items-center justify-between h-16">
					<div className="flex items-center space-x-8">
						{navItems.map((item) => {
							const isActive = pathname === item.href;
							return (
								<Link
									key={item.href}
									href={item.href}
									className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
										isActive
											? "bg-orange-500 text-white"
											: "text-gray-300 hover:text-white hover:bg-gray-800"
									}`}
								>
									<span>{item.icon}</span>
									<span>{item.label}</span>
								</Link>
							);
						})}
					</div>
					<div className="text-xs text-gray-500">
						Development Mode
					</div>
				</div>
			</div>
		</nav>
	);
}