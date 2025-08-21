"use client";

import { DialogDescription } from "@radix-ui/react-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

export default function AboutDialog({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-[800px] min-h-screen rounded-none md:rounded-md md:min-h-auto bg-white/10 border border-white/10 backdrop-blur-lg overflow-y-scroll max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Abstract</DialogTitle>
          <DialogDescription>
            A Cryptographic Voice Verification Network
          </DialogDescription>
        </DialogHeader>
        A fully encrypted, privacy-preserving voice verification network could effectively eliminate voice-based deepfake fraud without requiring users to compromise their security or personal data.
        <br />
        <br />
        Zero-knowledge proofs provide part of the solution, but a fundamental challenge remains: it is difficult to absolutely verify that a given voice truly belongs to a specific individual, especially as voice synthesising technology becomes increasingly sophisticated.
        <br />
        <br />
        This work introduces a solution to the verification problem by leveraging cryptoeconomics.
        <br />
        <br />
        Utilising the security of a Proof-of-Stake (PoS) consensus mechanism, and an open-source hardware system to couple vocal biosignal verification with voice audio.
        <br />
        <br />
        Cryptographic keys to voice biometrics and other sensitive data are derived from Trusted Execution Environments (TEEs) providing hardware-backed isolation.
        <br />
        <br />
        Access to these keys is granted to users through a consensual proto-Soulbound Token (SBT), a non-transferable, non-replicable digital asset tied to an individual’s digital identity.
        <br />
        <br />
        Over time, the user builds-up a personalised voice model, with each new audio sample organised and stored within a WavRAG structure—an Audio-Integrated Retrieval Augmented Generation framework, enabling efficient and context-rich retrieval of voice data.
        <br />
        <div className="text-center pt-2">
          <a
            href="https://www.papermark.com/view/cmbjtiei10001jr04kfyoo91q"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-medium rounded-lg transition-all duration-200 border border-white/30 hover:border-white/50"
          >
            Read White Paper
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
