import { useState } from "react";


type Props = {
    onSend: (message: string) => void;
};


export default function ChatInput({
    onSend
}: Props) {


    const [value, setValue] = useState("");



    function submit(e: React.FormEvent) {

        e.preventDefault();

        if (!value.trim()) return;

        onSend(value);

        setValue("");

    }



    return (

        <form
            className="input-area"
            onSubmit={submit}
        >


            <input

                value={value}

                placeholder="Ask about employee mental health..."

                onChange={(e) =>
                    setValue(e.target.value)
                }

            />


            <button>
                ➤
            </button>


        </form>

    );

}