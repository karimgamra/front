import { Form } from "react-router-dom";
import { useState } from "react";

const Contact = () => {
  const [showForm, setShowForm] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);

  const handleFormSubmit = (e: Event) => {
    e.preventDefault();
    // Add your form submission logic here
    alert("Form submitted!");
  };

  const handleChatbotOpen = () => {
    setShowChatbot(true);
    setShowForm(false);
    // Add your chatbot initialization logic here
  };

  return (
    <div className="h-screen grid place-content-center shadow-xl">
      <div className="max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">Contact Us</h2>

        {/* Option Buttons */}
        <div className="flex gap-4 justify-center mb-6">
          <button
            onClick={() => {
              setShowForm(true);
              setShowChatbot(false);
            }}
            className={`px-4 py-2 rounded ${
              showForm ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            Contact Team
          </button>
          <button
            onClick={handleChatbotOpen}
            className={`px-4 py-2 rounded ${
              showChatbot ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            Chatbot
          </button>
        </div>

        {/* Contact Form */}
        {showForm && (
          <Form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block mb-1">
                Name
              </label>
              <input
                id="name"
                type="text"
                required
                className="w-full border rounded px-3 py-2"
                placeholder="Your name"
              />
            </div>
            <div>
              <label htmlFor="email" className="block mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                className="w-full border rounded px-3 py-2"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label htmlFor="message" className="block mb-1">
                Message
              </label>
              <textarea
                id="message"
                required
                className="w-full border rounded px-3 py-2"
                rows="4"
                placeholder="Your message..."
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Submit
            </button>
          </Form>
        )}

        {/* Chatbot Placeholder */}
        {showChatbot && (
          <div className="border rounded p-4">
            <h3 className="text-lg font-semibold mb-2">Chatbot</h3>
            <div className="bg-gray-100 p-4 rounded h-64 overflow-y-auto">
              <p>Chatbot interface would go here.</p>
              <p>
                To implement a real chatbot, you could integrate with services
                like Dialogflow, Botpress, or a custom solution.
              </p>
            </div>
            <div className="mt-4">
              <input
                type="text"
                placeholder="Type your message..."
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Contact;
