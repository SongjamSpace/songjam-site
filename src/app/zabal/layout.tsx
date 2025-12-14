import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "$ZABAL Empire",
    description:
        "Assembling the Zabal so artists own profit - Building on Base for the Farcaster Future",
    openGraph: {
        title: "$ZABAL Empire",
        description:
            "Assembling the Zabal so artists own profit - Building on Base for the Farcaster Future",
        images: ["/images/banners/zaal.png"],
    },
    twitter: {
        card: "summary",
        title: "$ZABAL Empire",
        description:
            "Assembling the Zabal so artists own profit - Building on Base for the Farcaster Future",
        images: ["/images/banners/zaal.png"],
    },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
        </>
    );
}
