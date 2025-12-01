import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Undone x Williams Racing",
    description:
        "Precision watchmaking meets motorsport engineering. Developed by UNDONE's Japan-based design team. Shipping Worldwide.",
    openGraph: {
        title: "Undone x Williams Racing",
        description:
            "Precision watchmaking meets motorsport engineering. Developed by UNDONE's Japan-based design team. Shipping Worldwide.",
        images: ["/images/banners/undone.png"],
    },
    twitter: {
        card: "summary",
        title: "Undone x Williams Racing",
        description:
            "Precision watchmaking meets motorsport engineering. Developed by UNDONE's Japan-based design team. Shipping Worldwide.",
        images: ["/images/banners/undone.png"],
    },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
