import { useState } from "react";

import ChatInput from "./components/ChatInput";
import ChatWindow from "./components/ChatWindow";

import { askQuestion } from "./api/askClient";

import "./App.css";


type Message = {
  role: "user" | "assistant";
  content: string;
};


function App() {

  const [messages, setMessages] =
    useState<Message[]>([]);


  const [loading, setLoading] =
    useState(false);



  async function handleSend(
    question: string
  ) {

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: question,
      },
    ]);


    setLoading(true);


    try {

      const result =
        await askQuestion(question);


      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            result.answer ??
            JSON.stringify(result),
        },
      ]);


    } catch {

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I was unable to generate an answer. Please try again.",
        },
      ]);

    }
    finally {

      setLoading(false);

    }

  }



  return (

    <main className="page">


      <section className="chat-container">


        <header className="top-bar">


          <div className="brand">


            <div className="logo">
              M
            </div>


            <div>

              <h1>
                MindCare AI
              </h1>

              <p>
                Employee Mental Health Assistant
              </p>

            </div>


          </div>


          <div className="status">
            Online
          </div>


        </header>




        {
          messages.length === 0 && (

            <section className="welcome">


              <h2>
                Your workplace wellbeing assistant
              </h2>


              <p>
                Ask questions about employee mental
                health, workplace stress, wellbeing
                strategies, and psychological support.
              </p>


              <div className="suggestions">


                <button>
                  How can companies reduce employee stress?
                </button>


                <button>
                  How can managers support employees?
                </button>


                <button>
                  What improves workplace wellbeing?
                </button>


              </div>


            </section>

          )
        }



        <ChatWindow
          messages={messages}
        />



        {
          loading && (

            <div className="thinking">
              Generating response...
            </div>

          )
        }



        <ChatInput
          onSend={handleSend}
        />


      </section>


    </main>

  );
}


export default App;