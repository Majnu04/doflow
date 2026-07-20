import User from '../models/User.js';
import AnalyticsEvent from '../models/AnalyticsEvent.js';
import Course from '../models/Course.js';
import { sendUpgradeReminderEmail } from '../utils/emailService.js';

// @desc    Send upgrade reminders to users who viewed premium content but didn't purchase
// @route   POST /api/marketing/upgrade-reminders
// @access  Private/Admin
export const sendUpgradeReminders = async (req, res) => {
  try {
    const days = Number(req.body.days) || 7;
    const maxEmails = Number(req.body.maxEmails) || 50;

    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);

    const events = await AnalyticsEvent.find({
      eventType: { $in: ['checkout_start', 'premium_lock_view'] },
      user: { $ne: null },
      createdAt: { $gte: sinceDate }
    })
      .populate('course', 'title price discountPrice')
      .populate('user', 'name email purchases marketing')
      .sort({ createdAt: -1 })
      .limit(500);

    const sent = [];
    const skipped = [];

    for (const event of events) {
      if (sent.length >= maxEmails) break;
      const user = event.user;
      const course = event.course;

      if (!user || !course) continue;

      const alreadyPurchased = user.purchases?.some((p) => p.course?.toString() === course._id.toString() && p.status === 'completed');
      if (alreadyPurchased) {
        skipped.push({ userId: user._id, reason: 'already_purchased' });
        continue;
      }

      const lastSentAt = user.marketing?.lastUpgradeReminderAt;
      if (lastSentAt && (Date.now() - new Date(lastSentAt).getTime()) < 24 * 60 * 60 * 1000) {
        skipped.push({ userId: user._id, reason: 'cooldown' });
        continue;
      }

      const emailResult = await sendUpgradeReminderEmail(user.email, user.name, course);
      if (emailResult.success) {
        sent.push({ userId: user._id, courseId: course._id });
        await User.findByIdAndUpdate(user._id, {
          $set: { 'marketing.lastUpgradeReminderAt': new Date() },
          $inc: { 'marketing.upgradeReminderCount': 1 }
        });
      } else {
        skipped.push({ userId: user._id, reason: 'email_failed' });
      }
    }

    res.json({
      success: true,
      sentCount: sent.length,
      skippedCount: skipped.length,
      sent,
      skipped
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
