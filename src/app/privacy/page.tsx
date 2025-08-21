import Navbar from "@/components/navbar";

export default function PrivacyPage() {
  return (
    <div className="relative bg-[#F1E3EB] min-h-screen">
      <div className="p-4">
        <Navbar inverse />
      </div>
      <div className="max-w-4xl mx-auto px-4 py-8 text-[#48333D]">
        <h1 className="text-3xl lg:text-4xl font-bold uppercase mb-8">
          Privacy Policy
        </h1>

        <div className="prose prose-lg max-w-none space-y-6">
          <p className="font-semibold">Effective Date: July 1, 2025</p>
          <p className="font-semibold">Website: songjam.space</p>

          <p>
            Songjam (&ldquo;Songjam&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) respects your privacy and is committed to protecting your personal information. This Privacy Policy explains what information we collect, how we use it, and your choices in relation to your data when you use our voice verification platform.
          </p>

          <section>
            <h2 className="text-xl font-bold mb-3">1. Information We Collect</h2>

            <h3 className="text-lg font-semibold mb-2">a. Voice Biometric Data</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>When you use our voice verification services, we collect and process your voice audio samples for biometric verification purposes.</li>
              <li>This includes voice recordings, vocal characteristics, and associated metadata for deepfake prevention and voice security.</li>
              <li>Voice data is cryptographically processed and stored securely using hardware-backed isolation.</li>
            </ul>

            <h3 className="text-lg font-semibold mb-2 mt-4">b. Wallet & Identity Data</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>When you connect a crypto wallet, we collect your wallet address, which may be linked to public blockchain activity.</li>
              <li>We do not collect private keys or access your funds.</li>
              <li>Your wallet address is linked to your proto Soulbound Token for voice data access control.</li>
            </ul>

            <h3 className="text-lg font-semibold mb-2 mt-4">c. Voice Verification & Usage Data</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>We collect data about your voice verification sessions, including verification attempts, success rates, and security events.</li>
              <li>This data is used to improve our voice verification algorithms and prevent fraudulent activities.</li>
              <li>Voice data monetization preferences and researcher access permissions are stored as part of your profile.</li>
            </ul>

            <h3 className="text-lg font-semibold mb-2 mt-4">d. Usage & Analytics</h3>
            <p>We may automatically collect:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>IP address, device/browser info</li>
              <li>Pages viewed, clicks, time spent</li>
              <li>Log data for debugging or performance</li>
              <li>Referral sources (when applicable)</li>
            </ul>

            <h3 className="text-lg font-semibold mb-2 mt-4">e. Optional Personal Information</h3>
            <p>
              If you choose to provide additional data (e.g. email, username, avatar, etc.), we store that securely for authentication or personalization.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">2. How We Use Your Data</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Operate and improve the Songjam voice verification platform</li>
              <li>Provide cryptographic voice verification services and deepfake prevention</li>
              <li>Manage your voice data access through proto Soulbound Tokens</li>
              <li>Enable voice data monetization to researchers and AI services (with your consent)</li>
              <li>Maintain platform integrity and security</li>
              <li>Analyze platform usage for growth and optimization</li>
              <li>Communicate updates or respond to support inquiries</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">3. Sharing of Information</h2>
            <p>We do not sell your personal data. We may share data with:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Blockchain networks (public ledger activity for Soulbound Tokens)</li>
              <li>Research institutions and AI services (only with your explicit consent for voice data monetization)</li>
              <li>Service providers (hosting, analytics, email)</li>
              <li>Legal authorities when required by law</li>
              <li>Voice verification partners for security and fraud prevention</li>
            </ul>
            <p>
              All data shared with third parties is limited to what is necessary and governed by data processing agreements when applicable.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">4. Voice Data & Blockchain</h2>
            <p>
              Your voice biometric data is stored using hardware-backed cryptographic isolation and is never stored on public blockchains. However, your proto Soulbound Token and associated permissions are stored on-chain for access control. Please use caution when managing your voice data permissions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">5. Voice Data Monetization</h2>
            <p>If you choose to monetize your voice data:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>We will only share your voice data with researchers or AI services after obtaining your explicit consent</li>
              <li>You can control which types of research or services can access your data</li>
              <li>You can withdraw consent at any time</li>
              <li>Revenue from voice data monetization is shared according to our tokenomics model</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">6. Cookies & Tracking</h2>
            <p>We may use cookies or local storage to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Maintain user sessions</li>
              <li>Remember preferences</li>
              <li>Analyze usage via privacy-compliant analytics tools</li>
            </ul>
            <p>You can manage or disable cookies in your browser settings.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">7. Your Rights</h2>
            <p>Depending on your jurisdiction, you may have rights to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access the data we have about you</li>
              <li>Request correction or deletion of personal data</li>
              <li>Opt-out of voice data monetization at any time</li>
              <li>Request deletion of your voice biometric data</li>
              <li>Opt-out of tracking (where applicable)</li>
              <li>Withdraw consent for data sharing</li>
            </ul>
            <p>To exercise these rights, email: support@songjam.space</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">8. Data Security</h2>
            <p>
              We use industry-standard security measures and hardware-backed cryptographic isolation to protect your voice data. However, no platform is completely secure. Protect your wallet, avoid phishing links, and don&rsquo;t share sensitive data unnecessarily.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">9. Children&rsquo;s Privacy</h2>
            <p>
              Songjam is not intended for children under 13. If you are a parent or guardian and believe we have collected data from a child, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We&rsquo;ll notify you of significant changes via the site or email. Continued use after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">11. Contact Us</h2>
            <p>
              If you have questions, concerns, or requests related to privacy: 📧 support@songjam.space
            </p>
          </section>
        </div>

        <div className="text-center text-sm text-white/60 mt-12">
          COPYRIGHT © 2025 SONGJAM
        </div>
      </div>
    </div>
  );
}
