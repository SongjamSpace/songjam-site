import Navbar from "@/components/navbar";

export default function TermsPage() {
  return (
    <div className="relative bg-[#F1E3EB] min-h-screen">
      <div className="p-4">
        <Navbar inverse />
      </div>
      <div className="max-w-4xl mx-auto px-4 py-8 text-[#48333D]">
        <h1 className="text-3xl lg:text-4xl font-bold uppercase mb-8">
          Terms of Service
        </h1>

        <div className="prose prose-lg max-w-none space-y-6">
          <p className="font-semibold">Effective Date: July 1, 2025</p>

          <p>
            Welcome to Songjam (&ldquo;Songjam&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) at songjam.space. By accessing or using our platform, you agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;). Please read them carefully.
          </p>

          <section>
            <h2 className="text-xl font-bold mb-3">1. Overview</h2>
            <p>
              Songjam is a cryptographic voice verification network powered by $SANG. In the age of AI, a voice recording of a few seconds is enough to create a deepfake clone. 'Vishing' or 'Voice Phishing' is a social engineering attack which leverages deepfake voices. Songjam cryptographically secures your voice to prevent these attacks.
            </p>
            <p>
              Our platform enables users to verify their voice in the age of AI, own their data through a proto Soulbound Token which evolves with them, and monetize their voice data to researchers or make it available for AI assistants, voiceovers and reader apps.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">2. Eligibility</h2>
            <p>
              You must be at least 13 years old to use Songjam. If you are under the age of majority in your jurisdiction, you may only use Songjam with the consent of a parent or legal guardian.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">3. User Accounts</h2>
            <p>
              You may be required to connect a wallet, create an account, or verify your identity to access certain features. You are responsible for all activities under your account or wallet connection. Never share your private keys or login credentials with anyone.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">4. Voice Data & Verification</h2>
            <p>By using Songjam's voice verification services:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You retain ownership of your voice data.</li>
              <li>You confirm that your voice data does not violate any laws or infringe on intellectual property rights.</li>
              <li>You acknowledge that voice verification outputs may reflect your biometric data, and agree to use such tools ethically and responsibly.</li>
              <li>You consent to the cryptographic processing and storage of your voice data for verification purposes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">5. Intellectual Property</h2>
            <p>
              All Songjam software, branding, and content (excluding user-generated voice data) are the property of Songjam or its licensors. You may not copy, distribute, reverse engineer, or create derivative works without written consent.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">6. Prohibited Conduct</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use Songjam for illegal, abusive, or malicious purposes.</li>
              <li>Upload or generate voice data that is hateful, deceptive, or infringes on others&rsquo; rights.</li>
              <li>Attempt to exploit or disrupt the platform or its voice verification infrastructure.</li>
              <li>Impersonate any individual or use voice data in a misleading way.</li>
              <li>Attempt to bypass or circumvent voice verification systems.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">7. Blockchain & Token Interactions</h2>
            <p>Songjam leverages blockchain networks and smart contracts to register voice verification data, Soulbound Tokens, and enable transactions. You agree that:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Transactions are irreversible and public.</li>
              <li>Songjam is not responsible for losses due to gas fees, blockchain malfunctions, or third-party services.</li>
              <li>You must comply with any token, verification, or wallet terms set forth on chain.</li>
              <li>Voice data monetization transactions are subject to blockchain network rules and fees.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">8. Disclaimers</h2>
            <p>
              Songjam is provided &ldquo;as is&rdquo; without warranties of any kind. We do not guarantee:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Availability, accuracy, or performance of any voice verification services.</li>
              <li>Security or error-free operation of voice verification systems.</li>
              <li>Fitness of voice verification for any particular use case.</li>
              <li>Complete protection against all forms of voice-based fraud or deepfake attacks.</li>
            </ul>
            <p>Use of Songjam and associated voice verification tools is at your own risk.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">9. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, Songjam and its affiliates shall not be liable for any indirect, incidental, special, or consequential damages, including voice data loss, identity exposure, or reputational harm arising from your use of the platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">10. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your access to Songjam at our sole discretion, especially if you violate these Terms or harm the platform or community.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">11. Modifications</h2>
            <p>
              We may update these Terms from time to time. Changes will be effective upon posting. Continued use after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">12. Governing Law</h2>
            <p>
              These Terms are governed by the laws of Hong Kong, without regard to conflict of law principles.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">13. Contact</h2>
            <p>
              For questions, issues, or legal notices, contact: 📧 support@songjam.space
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