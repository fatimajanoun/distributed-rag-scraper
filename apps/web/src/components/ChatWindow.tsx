type Message = {
  role: "user" | "assistant";
  content: string;
};


type Props = {
  messages: Message[];
};



export default function ChatWindow({
  messages,
}: Props) {


  return (

    <div className="chat-window">


      {
        messages.map(
          (message,index)=>(

            <div
              key={index}
              className={`message ${message.role}`}
            >


              <div className="role">

                {
                  message.role === "user"
                    ? "You"
                    : "MindCare AI"
                }

              </div>



              <div className="bubble">

                {message.content}

              </div>


            </div>

          )
        )
      }


    </div>

  );

}