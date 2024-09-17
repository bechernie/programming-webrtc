import styles from "./Features.module.css";
import Button from "@components/Button/Button.tsx";
import { useFeaturesContext } from "@components/Features/FeaturesContext.ts";

function Features({ className }: { className?: string }) {
  const { selfFeatures, toggleSelfAudioFeature, toggleSelfVideoFeature } =
    useFeaturesContext();

  return (
    <footer className={[styles.footer, className].filter(Boolean).join(" ")}>
      <Button
        aria-label={"Toggle microphone"}
        role={"switch"}
        aria-checked={selfFeatures.audio}
        type={"button"}
        onClick={toggleSelfAudioFeature}
      >
        Mic
      </Button>
      <Button
        aria-label={"Toggle camera"}
        role={"switch"}
        aria-checked={selfFeatures.video}
        type={"button"}
        onClick={toggleSelfVideoFeature}
      >
        Cam
      </Button>
    </footer>
  );
}

export default Features;
