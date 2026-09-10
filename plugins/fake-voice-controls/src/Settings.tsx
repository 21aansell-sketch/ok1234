import { Forms } from "@vendetta/ui/components";
import { setFakeMute, setFakeDeafen, voiceState } from "./state";

const { FormSection, FormRow, FormSwitch, FormText } = Forms;

export default () => (
    <>
        <FormSection title="Fake voice controls">
            <FormText>
                These switches change the voice state Discord advertises. They are not a
                privacy feature: test your client after Discord updates.
            </FormText>

            <FormRow
                label="Fake mute"
                subLabel="Show as muted while keeping local mic state unchanged."
                trailing={
                    <FormSwitch
                        value={voiceState.fakeMute}
                        onValueChange={setFakeMute}
                    />
                }
            />

            <FormRow
                label="Fake deafen"
                subLabel="Show as deafened while keeping local audio state unchanged."
                trailing={
                    <FormSwitch
                        value={voiceState.fakeDeafen}
                        onValueChange={setFakeDeafen}
                    />
                }
            />
        </FormSection>
    </>
);
