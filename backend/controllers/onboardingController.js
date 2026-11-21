/**
 * Onboarding Controller for PhishGuard
 * Manages interactive guided tour progress, completion, skip, and reset state.
 * Supports Microsoft SQL Server (UserOnboardingProgress) and synchronized memory fallback.
 */

const { inMemoryStore, executeQuery, sql } = require('../config/db');

exports.getOnboardingStatus = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Check SQL Server
    try {
      const result = await executeQuery('EXEC dbo.sp_GetUserOnboarding @UserID = @UserID', { UserID: userId });
      if (result && result.recordset && result.recordset.length > 0) {
        const row = result.recordset[0];
        return res.json({
          success: true,
          data: {
            onboardingId: row.OnboardingID,
            userId: row.UserID,
            isCompleted: Boolean(row.IsCompleted),
            isSkipped: Boolean(row.IsSkipped),
            currentStep: row.CurrentStep,
            startedAt: row.StartedAt,
            completedAt: row.CompletedAt,
            isNewUser: !row.IsCompleted && !row.IsSkipped
          }
        });
      }
    } catch (sqlErr) {
      // Fall through to memory store
    }

    // Fallback store
    let progress = inMemoryStore.userOnboardingProgress.find(p => p.UserID === userId);
    if (!progress) {
      // For any user who hasn't yet started or registered, default to new user needing tour
      progress = {
        OnboardingID: inMemoryStore.userOnboardingProgress.length + 1,
        UserID: userId,
        IsCompleted: false,
        IsSkipped: false,
        CurrentStep: 1,
        StartedAt: new Date().toISOString(),
        CompletedAt: null,
        LastUpdatedAt: new Date().toISOString()
      };
      inMemoryStore.userOnboardingProgress.push(progress);
    }

    res.json({
      success: true,
      data: {
        onboardingId: progress.OnboardingID,
        userId: progress.UserID,
        isCompleted: Boolean(progress.IsCompleted),
        isSkipped: Boolean(progress.IsSkipped),
        currentStep: progress.CurrentStep,
        startedAt: progress.StartedAt,
        completedAt: progress.CompletedAt,
        isNewUser: !progress.IsCompleted && !progress.IsSkipped
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve onboarding status', error: err.message });
  }
};

exports.saveOnboardingProgress = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentStep = 1, isCompleted = false, isSkipped = false } = req.body;

    // Try SQL Server
    try {
      await executeQuery(
        'EXEC dbo.sp_SaveUserOnboardingProgress @UserID = @UserID, @CurrentStep = @CurrentStep, @IsCompleted = @IsCompleted, @IsSkipped = @IsSkipped',
        {
          UserID: userId,
          CurrentStep: currentStep,
          IsCompleted: isCompleted ? 1 : 0,
          IsSkipped: isSkipped ? 1 : 0
        }
      );
    } catch (sqlErr) {
      // Fall through
    }

    // Update memory store
    let progress = inMemoryStore.userOnboardingProgress.find(p => p.UserID === userId);
    if (!progress) {
      progress = {
        OnboardingID: inMemoryStore.userOnboardingProgress.length + 1,
        UserID: userId,
        IsCompleted: Boolean(isCompleted),
        IsSkipped: Boolean(isSkipped),
        CurrentStep: currentStep,
        StartedAt: new Date().toISOString(),
        CompletedAt: isCompleted ? new Date().toISOString() : null,
        LastUpdatedAt: new Date().toISOString()
      };
      inMemoryStore.userOnboardingProgress.push(progress);
    } else {
      progress.CurrentStep = currentStep;
      progress.IsCompleted = Boolean(isCompleted);
      progress.IsSkipped = Boolean(isSkipped);
      if (isCompleted && !progress.CompletedAt) {
        progress.CompletedAt = new Date().toISOString();
      }
      progress.LastUpdatedAt = new Date().toISOString();
    }

    res.json({
      success: true,
      message: 'Onboarding progress saved',
      data: {
        userId,
        currentStep: progress.CurrentStep,
        isCompleted: progress.IsCompleted,
        isSkipped: progress.IsSkipped
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to save onboarding progress', error: err.message });
  }
};

exports.resetOnboarding = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Try SQL Server
    try {
      await executeQuery('EXEC dbo.sp_ResetUserOnboarding @UserID = @UserID', { UserID: userId });
    } catch (sqlErr) {
      // Fall through
    }

    // Update memory store
    let progress = inMemoryStore.userOnboardingProgress.find(p => p.UserID === userId);
    if (progress) {
      progress.CurrentStep = 1;
      progress.IsCompleted = false;
      progress.IsSkipped = false;
      progress.CompletedAt = null;
      progress.LastUpdatedAt = new Date().toISOString();
    } else {
      progress = {
        OnboardingID: inMemoryStore.userOnboardingProgress.length + 1,
        UserID: userId,
        IsCompleted: false,
        IsSkipped: false,
        CurrentStep: 1,
        StartedAt: new Date().toISOString(),
        CompletedAt: null,
        LastUpdatedAt: new Date().toISOString()
      };
      inMemoryStore.userOnboardingProgress.push(progress);
    }

    res.json({
      success: true,
      message: 'Onboarding tour reset successfully for replay',
      data: {
        userId,
        currentStep: 1,
        isCompleted: false,
        isSkipped: false,
        isNewUser: true
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to reset onboarding', error: err.message });
  }
};
