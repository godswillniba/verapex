
import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Phone, Mail } from 'lucide-react';
import './css/ChatBox.css';

const ChatBox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasSeenIntro, setHasSeenIntro] = useState(() => {
    return localStorage.getItem('hasSeenChatIntro') === 'true';
  });
  const chatBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let closeTimer: NodeJS.Timeout;
    let touchStartY = 0;
    
    if (isOpen) {
      closeTimer = setTimeout(() => {
        setIsOpen(false);
      }, 10000);
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (chatBoxRef.current && !chatBoxRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleTouchStart = (event: TouchEvent) => {
      touchStartY = event.touches[0].clientY;
    };

    const handleTouchMove = (event: TouchEvent) => {
      const touchEndY = event.touches[0].clientY;
      const yDiff = touchEndY - touchStartY;
      
      if (yDiff > 50) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);

    return () => {
      clearTimeout(closeTimer);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!hasSeenIntro) {
      setTimeout(() => {
        const button = document.querySelector('.chat-button');
        if (button) {
          button.classList.add('wiggle');
          setTimeout(() => {
            button.classList.remove('wiggle');
            setIsOpen(true);
          }, 1000);
        }
      }, 2000);

      localStorage.setItem('hasSeenChatIntro', 'true');
      setHasSeenIntro(true);
    }
  }, [hasSeenIntro]);

  const handleWhatsApp = () => {
    window.open('https://wa.me/your_number_here', '_blank');
  };

  const handleTelegram = () => {
    window.open('https://t.me/your_username', '_blank');
  };

  const handleEmail = () => {
    window.open('mailto:your_email@example.com', '_blank');
  };

  return (
    <div className="chat-box-container" ref={chatBoxRef}>
      {!hasSeenIntro && isOpen && (
        <div className="first-time-message">
          Welcome! Tap here if you need any assistance or have questions. We're here to help! 😊
        </div>
      )}
      {isOpen ? (
        <div className="chat-box">
          <div className="chat-box-header">
            <h3>Contact Us</h3>
            <button onClick={() => setIsOpen(false)} className="close-button">
              <X size={20} />
            </button>
          </div>
          <div className="chat-box-content">
            <button onClick={handleWhatsApp} className="contact-option whatsapp">
              <Send size={20} />
              WhatsApp
            </button>
            <button onClick={handleTelegram} className="contact-option telegram">
              <Send size={20} />
              Telegram
            </button>
            <button onClick={handleEmail} className="contact-option email">
              <Mail size={20} />
              Email
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setIsOpen(true)} className="chat-button">
          <MessageSquare size={24} />
        </button>
      )}
    </div>
  );
};

export default ChatBox;
