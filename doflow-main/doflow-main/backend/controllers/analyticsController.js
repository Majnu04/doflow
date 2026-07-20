import AnalyticsEvent from '../models/AnalyticsEvent.js';
import Course from '../models/Course.js';

// @desc    Track analytics event
// @route   POST /api/analytics/event
// @access  Public (user optional)
export const trackEvent = async (req, res) => {
  try {
    const { eventType, courseId, sessionId, metadata } = req.body;

    if (!eventType) {
      return res.status(400).json({ message: 'eventType is required' });
    }

    const payload = {
      eventType,
      sessionId,
      metadata: metadata || {}
    };

    if (courseId) {
      payload.course = courseId;
    }

    if (req.user?._id) {
      payload.user = req.user._id;
    }

    const event = await AnalyticsEvent.create(payload);

    res.status(201).json({ success: true, eventId: event._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get conversion analytics
// @route   GET /api/analytics/conversions
// @access  Private/Admin
export const getConversionAnalytics = async (req, res) => {
  try {
    const courseId = req.query.courseId || null;
    const days = Number(req.query.days) || 30;

    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);

    const match = {
      createdAt: { $gte: sinceDate }
    };

    if (courseId) {
      match.course = courseId;
    }

    const [views, locks, ctaClicks, checkouts, purchases] = await Promise.all([
      AnalyticsEvent.countDocuments({ ...match, eventType: 'course_view' }),
      AnalyticsEvent.countDocuments({ ...match, eventType: 'premium_lock_view' }),
      AnalyticsEvent.countDocuments({ ...match, eventType: 'upgrade_cta_click' }),
      AnalyticsEvent.countDocuments({ ...match, eventType: 'checkout_start' }),
      AnalyticsEvent.countDocuments({ ...match, eventType: 'purchase_completed' })
    ]);

    const conversion = {
      viewToCheckout: views > 0 ? (checkouts / views) * 100 : 0,
      checkoutToPurchase: checkouts > 0 ? (purchases / checkouts) * 100 : 0,
      viewToPurchase: views > 0 ? (purchases / views) * 100 : 0,
      lockToCTA: locks > 0 ? (ctaClicks / locks) * 100 : 0
    };

    let course = null;
    if (courseId) {
      course = await Course.findById(courseId).select('title price discountPrice');
    }

    res.json({
      periodDays: days,
      course,
      counts: {
        views,
        premiumLockViews: locks,
        upgradeCtaClicks: ctaClicks,
        checkoutStarts: checkouts,
        purchases
      },
      conversionRates: conversion
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
