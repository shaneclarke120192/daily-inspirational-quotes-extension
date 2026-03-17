// popup.js

const API_BASE_URL = 'https://inspirefeeds.com/api';

// Get or create anonymous user ID
async function getUserId() {
  let result = await chrome.storage.local.get('userId');
  if (!result.userId) {
    const userId = crypto.randomUUID();
    await chrome.storage.local.set({ userId });
    return userId;
  }
  return result.userId;
}

// Load a random quote from server
async function loadQuote() {
  const quoteDisplay = document.getElementById('quoteDisplay');
  quoteDisplay.innerHTML = '<div class="loading">Loading quote...</div>';

  try {
    const userId = await getUserId();
    const response = await fetch(`${API_BASE_URL}/quote?userId=${encodeURIComponent(userId)}`);
    if (!response.ok) throw new Error('Failed to load quote');
    const quote = await response.json();
    displayQuote(quote);
  } catch (error) {
    quoteDisplay.innerHTML = '<div class="error">Failed to load quote. Please try again.</div>';
  }
}

// Display quote and buttons
function displayQuote(quote) {
  const quoteDisplay = document.getElementById('quoteDisplay');
  
  quoteDisplay.innerHTML = `
    <div class="quote-text">"${quote.text}"</div>
    <div class="quote-author">— ${quote.author}</div>
    <div class="reaction-buttons">
      <button class="reaction-btn like-btn ${quote.userVote === 'like' ? 'active liked' : ''}" data-reaction="like">👍</button>
      <button class="reaction-btn dislike-btn ${quote.userVote === 'dislike' ? 'active disliked' : ''}" data-reaction="dislike">👎</button>
    </div>
    <div class="vote-counts">
      <span class="vote-count">👍 <span id="likesCount">${quote.likes || 0}</span></span>
      <span class="vote-count">👎 <span id="dislikesCount">${quote.dislikes || 0}</span></span>
    </div>
    <div class="feedback-section">
      <button id="showFeedbackBtn" class="feedback-toggle">Give Feedback</button>
      <div id="feedbackForm" class="feedback-form hidden">
        <textarea id="feedbackText" placeholder="Tell us what you think about this quote or the extension..." rows="3"></textarea>
        <button id="submitFeedbackBtn" class="submit-feedback">Send Feedback</button>
        <div id="feedbackStatus" class="feedback-status"></div>
      </div>
    </div>
    <div class="footer">Quote ID: ${quote.id}</div>
  `;

  window.currentQuoteId = quote.id;

  // Add event listeners
  document.querySelectorAll('.reaction-btn').forEach(btn => {
    btn.addEventListener('click', handleReaction);
  });

  setupFeedback();
}

// Handle like/dislike clicks
async function handleReaction(event) {
  const button = event.currentTarget;
  const reaction = button.dataset.reaction;
  const quoteId = window.currentQuoteId;

  if (!quoteId) return;

  // Disable buttons temporarily
  document.querySelectorAll('.reaction-btn').forEach(btn => btn.disabled = true);

  try {
    const userId = await getUserId();
    const response = await fetch(`${API_BASE_URL}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, quoteId, reaction })
    });

    if (!response.ok) throw new Error('Vote failed');

    const result = await response.json();

    // Update counts
    document.getElementById('likesCount').textContent = result.likes;
    document.getElementById('dislikesCount').textContent = result.dislikes;

    // Remove all active classes
    document.querySelectorAll('.reaction-btn').forEach(btn => {
      btn.classList.remove('active', 'liked', 'disliked');
    });

    // Set active class based on userVote from server
    if (result.userVote === 'like') {
      document.querySelector('.like-btn').classList.add('active', 'liked');
    } else if (result.userVote === 'dislike') {
      document.querySelector('.dislike-btn').classList.add('active', 'disliked');
    }

  } catch (error) {
    console.error(error);
    alert('Failed to submit vote. Please try again.');
  } finally {
    // Re-enable buttons
    document.querySelectorAll('.reaction-btn').forEach(btn => btn.disabled = false);
  }
}

// Setup feedback toggle and submission
function setupFeedback() {
  const toggleBtn = document.getElementById('showFeedbackBtn');
  const feedbackForm = document.getElementById('feedbackForm');
  const submitBtn = document.getElementById('submitFeedbackBtn');
  const feedbackText = document.getElementById('feedbackText');
  const feedbackStatus = document.getElementById('feedbackStatus');

  toggleBtn.addEventListener('click', () => {
    feedbackForm.classList.toggle('hidden');
    if (!feedbackForm.classList.contains('hidden')) {
      feedbackText.focus();
    }
  });

  submitBtn.addEventListener('click', async () => {
    const text = feedbackText.value.trim();
    if (!text) {
      // Remove any inline styles and set class
      feedbackStatus.removeAttribute('style');
      feedbackStatus.classList.add('feedback-message');
      feedbackStatus.textContent = 'Please enter some feedback.';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    feedbackStatus.textContent = '';
    feedbackStatus.removeAttribute('style');
    feedbackStatus.classList.add('feedback-message');

    try {
      const userId = await getUserId();
      const response = await fetch(`${API_BASE_URL}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          quoteId: window.currentQuoteId,
          feedbackText: text
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Server error');
      }

      // Success
      feedbackStatus.textContent = 'Thank you for your feedback!';
      feedbackText.value = '';

      setTimeout(() => {
        feedbackForm.classList.add('hidden');
        feedbackStatus.textContent = '';
        feedbackStatus.classList.remove('feedback-message');
      }, 2000);

    } catch (error) {
      console.error(error);
      feedbackStatus.textContent = error.message;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Feedback';
    }
  });
}

// Initialize
document.addEventListener('DOMContentLoaded', loadQuote);
