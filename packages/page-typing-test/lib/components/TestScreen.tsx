import { Screen } from "@keybr/pages-shared";
import { type LineList, makeStats, type Stats } from "@keybr/textinput";
import { TextArea } from "@keybr/textinput-ui";
import { type Focusable, Spacer } from "@keybr/widget";
import { memo, useEffect, useRef, useState } from "react";
import { type TextGenerator } from "../generators/index.ts";
import { Session } from "../session/index.ts";
import { type CompositeSettings } from "../settings.ts";
import { LineTemplate } from "./LineTemplate.tsx";
import * as styles from "./TestScreen.module.less";
import { Toolbar } from "./Toolbar.tsx";

export const TestScreen = memo(function TestScreen({
  settings,
  generator,
  mark,
  onComplete,
  onConfigure,
}: {
  readonly settings: CompositeSettings;
  readonly generator: TextGenerator;
  readonly mark: unknown;
  readonly onComplete: (stats: Stats) => void;
  readonly onConfigure: () => void;
}) {
  const focusRef = useRef<Focusable>(null);
  const [session, setSession] = useState<Session>(null!);
  const [lines, setLines] = useState<LineList>({ text: "", lines: [] });
  useEffect(() => {
    generator.reset(mark);
    const session = nextTest(settings, generator);
    setSession(session);
    setLines({ text: "", lines: session.getLines() });
  }, [settings, generator, mark]);
  return (
    <Screen>
      <Toolbar
        onConfigure={onConfigure}
        onChange={() => {
          focusRef.current?.focus();
        }}
      />
      <Spacer size={10} />
      <div className={styles.text}>
        <TextArea
          focusRef={focusRef}
          settings={settings.textDisplay}
          lines={lines}
          wrap={false}
          onFocus={() => {
            generator.reset(mark);
            const session = nextTest(settings, generator);
            setSession(session);
            setLines({ text: "", lines: session.getLines() });
          }}
          onInput={(event) => {
            const [feedback, progress, completed] = session.handleInput(event);
            setLines({ text: "", lines: session.getLines() });
            if (completed) {
              onComplete(makeStats(session.getSteps()));
            }
          }}
          lineTemplate={LineTemplate}
        />
      </div>
    </Screen>
  );
});

function nextTest(settings: CompositeSettings, generator: TextGenerator) {
  return new Session({ ...settings, numLines: 7, numCols: 55 }, generator);
}