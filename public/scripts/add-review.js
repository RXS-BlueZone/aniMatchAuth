let isValidReview = false;
let isValidSummary = false;

document.addEventListener("DOMContentLoaded", () => {
  const review = document.getElementById("review");
  const summary = document.getElementById("summary");
  const reviewMirror = document.getElementById("review-mirror");
  const scoreElement = document.getElementById("score");
  const submitButton = document.getElementById("submit-review");
  const reviewNotif = document.getElementById("review-notif");
  const summaryNotif = document.getElementById("summary-notif");

  // Initial validation checks (important!)
  checkReviewLength();
  checkSummaryLength();
  showSaveButton();

  review.addEventListener("input", () => {
    checkReviewLength();
    showSaveButton();
    try {
      const sanitizedReview = DOMPurify.sanitize(review.value);
      reviewMirror.textContent = sanitizedReview;
      reviewMirror.style.height = reviewMirror.scrollHeight + "px";
      autoGrow(review);
      restoreHeight(review);
    } catch (error) {
      console.error("Error sanitizing review:", error);
      alert(
        "An error occurred sanitizing your review. Please check your input and try again."
      );
    }
  });

  summary.addEventListener("input", () => {
    autoGrow(summary);
    checkSummaryLength();
    showSaveButton();
  });

  scoreElement.addEventListener("blur", () => {
    const score = parseInt(scoreElement.value);
    scoreElement.value = Math.max(0, Math.min(100, isNaN(score) ? 50 : score));
  });

  submitButton.addEventListener("click", validateAndSubmit);

  review.addEventListener("cut", () => {
    try {
      const sanitizedReview = DOMPurify.sanitize(review.value);
      reviewMirror.textContent = sanitizedReview;
      reviewMirror.style.height = reviewMirror.scrollHeight + "px";
      autoGrow(review);
      restoreHeight(review);
    } catch (error) {
      console.error("Error sanitizing review:", error);
      alert(
        "An error occurred sanitizing your review. Please check your input and try again."
      );
    }

    checkSummaryLength();
    showSaveButton();
  });

  review.addEventListener("change", () => {
    try {
      const sanitizedReview = DOMPurify.sanitize(review.value);
      reviewMirror.textContent = sanitizedReview;
      reviewMirror.style.height = reviewMirror.scrollHeight + "px";
      autoGrow(review);
    } catch (error) {
      console.error("Error sanitizing review:", error);
      alert(
        "An error occurred sanitizing your review. Please check your input and try again."
      );
    }

    checkSummaryLength();
    showSaveButton();
  });

  summary.addEventListener("cut", () => {
    autoGrow(summary);
    checkSummaryLength();
    showSaveButton();
  });

  summary.addEventListener("change", () => {
    autoGrow(summary);
    checkSummaryLength();
    showSaveButton();
  });
});

function autoGrow(element) {
  element.style.height = element.scrollHeight + "px";
}

function restoreHeight(element) {
  if (element.value === "") {
    element.style.height = "auto";
    restoreHeightMirror();
  }
}

function restoreHeightMirror() {
  const reviewMirror = document.getElementById("review-mirror");
  reviewMirror.style.height = "auto";
}

function checkReviewLength() {
  isValidReview = review.value.length >= 2200;
}

function checkSummaryLength() {
  const summaryLength = summary.value.length;
  isValidSummary = summaryLength >= 20 && summaryLength <= 120;
}

function validateAndSubmit() {
  if (!isValidReview) {
    alert("Review must be greater than 2200 characters.");
    review.focus();
    return;
  }
  if (!isValidSummary) {
    alert("Summary must be between 20 and 120 characters.");
    summary.focus();
    return;
  }
  const score = parseInt(document.getElementById("score").value);
  if (isNaN(score) || score < 0 || score > 100) {
    alert("Please enter a valid score between 0 and 100.");
    document.getElementById("score").focus();
    return;
  }
}

function showSaveButton() {
  const saveButton = document.getElementById("submit-review");
  const reviewNotif = document.getElementById("review-notif");
  const summaryNotif = document.getElementById("summary-notif");

  saveButton.style.display = isValidReview && isValidSummary ? "block" : "none";
  reviewNotif.style.display = !isValidReview ? "flex" : "none";
  summaryNotif.style.display = !isValidSummary ? "flex" : "none";
}

function addScore(value) {
  const score = document.getElementById("score");
  score.value = Math.max(0, Math.min(100, parseInt(score.value) + value));
}
