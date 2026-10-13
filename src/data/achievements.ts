import { AchievementBadgeData, DayRecord, UserProfile } from '../types';
import { calculateDayNutrition } from '../utils/nutritionCalculations';

export const EVALUATE_ACHIEVEMENTS = (
  records: Record<string, DayRecord>,
  personalRecords: Record<string, number>,
  user: UserProfile
): AchievementBadgeData[] => {
  const allDays = Object.values(records);
  const proteinGoal = user.goals.protein || 120;

  // Max daily protein logged
  let maxProteinInDay = 0;
  let maxLeucineInDay = 0;
  let maxMicrosScore = 0;
  let maxWaterMl = 0;
  let maxProteinStaplesInDay = 0;

  allDays.forEach((day) => {
    const nut = calculateDayNutrition(day.meals);
    if (nut.protein > maxProteinInDay) maxProteinInDay = nut.protein;
    if (nut.leucineG > maxLeucineInDay) maxLeucineInDay = nut.leucineG;
    if (nut.overallMicronutrientScore > maxMicrosScore) maxMicrosScore = nut.overallMicronutrientScore;

    const water = day.care?.waterMl || 0;
    if (water > maxWaterMl) maxWaterMl = water;

    // Count unique high protein food groups
    const proteinFoods = new Set(
      day.meals
        .filter((m) => m.food.protein >= 10 || m.food.foodGroup === 'protein')
        .map((m) => m.food.id)
    );
    if (proteinFoods.size > maxProteinStaplesInDay) maxProteinStaplesInDay = proteinFoods.size;
  });

  // Calisthenics PRs
  const standardPushPr = personalRecords['push-standard'] || 0;
  const diamondPr = personalRecords['push-diamond'] || 0;
  const archerPr = personalRecords['push-archer'] || 0;
  const handstandPr = personalRecords['push-handstand'] || 0;
  const wallPushPr = personalRecords['push-wall'] || 0;
  const australianRowsPr = personalRecords['pull-australian-rows'] || 0;
  const pistolPr = personalRecords['legs-pistol-box'] || personalRecords['legs-pistol-full'] || 0;

  // Total logged workouts count
  const totalWorkouts = allDays.reduce((acc, d) => acc + (d.workouts?.length || 0), 0);

  // Total XP
  const totalXP = Object.entries(personalRecords).reduce((acc, [_, reps]) => acc + reps * 15, 0);

  const achievements: AchievementBadgeData[] = [
    // ================= PROTEIN & LEAN MUSCLE MEDALS =================
    {
      id: 'protein-starter',
      title: 'Plant Protein Initiate',
      subtitle: 'First 50g Plant Protein Day',
      description: 'Logged at least 50g of clean plant-based protein in a single day.',
      category: 'protein',
      tier: 'bronze',
      icon: '🌱',
      xpReward: 150,
      fuelLore: 'Every single plant cell contains amino acids. You have ignited the anabolic foundation.',
      isUnlocked: maxProteinInDay >= 50,
      progressPct: Math.min(100, Math.round((maxProteinInDay / 50) * 100)),
      currentValueText: `${Math.round(maxProteinInDay)}g`,
      targetValueText: '50g in 1 day',
    },
    {
      id: 'protein-target',
      title: 'Muscle Synthesizer',
      subtitle: 'Daily Protein Target Smashed',
      description: `Hit 100% of your personalized daily target (${proteinGoal}g protein).`,
      category: 'protein',
      tier: 'silver',
      icon: '🥈',
      xpReward: 300,
      fuelLore: 'Optimal muscle protein synthesis reached through high-density lentils, tofu, and grains.',
      isUnlocked: maxProteinInDay >= proteinGoal,
      progressPct: Math.min(100, Math.round((maxProteinInDay / proteinGoal) * 100)),
      currentValueText: `${Math.round(maxProteinInDay)}g`,
      targetValueText: `${proteinGoal}g target`,
    },
    {
      id: 'protein-hypertrophy',
      title: 'Hypertrophy Titan',
      subtitle: '140g+ Massive Plant Fuel',
      description: 'Pushed past 140g of pure vegan protein in one single day for severe muscle repair.',
      category: 'protein',
      tier: 'gold',
      icon: '🥇',
      xpReward: 500,
      fuelLore: 'Seitan, TVP, and lupin power! Lean muscle hypertrophy requires consistent amino saturation.',
      isUnlocked: maxProteinInDay >= 140,
      progressPct: Math.min(100, Math.round((maxProteinInDay / 140) * 100)),
      currentValueText: `${Math.round(maxProteinInDay)}g`,
      targetValueText: '140g in 1 day',
    },
    {
      id: 'protein-leucine',
      title: 'mTOR Leucine Trigger',
      subtitle: '3.0g+ Leucine Peak',
      description: 'Reached 3.0g+ of estimated leucine, fully triggering the cellular mTOR hypertrophy pathway.',
      category: 'protein',
      tier: 'diamond',
      icon: '💎',
      xpReward: 600,
      fuelLore: 'Leucine is the primary branched-chain trigger for muscle hypertrophy. Plant variety hits it cleanly.',
      isUnlocked: maxLeucineInDay >= 3.0,
      progressPct: Math.min(100, Math.round((maxLeucineInDay / 3.0) * 100)),
      currentValueText: `${Math.round(maxLeucineInDay * 10) / 10}g`,
      targetValueText: '3.0g leucine in 1 day',
    },
    {
      id: 'protein-variety',
      title: 'Rainbow Protein Alchemist',
      subtitle: '4+ Distinct Protein Staples',
      description: 'Logged 4 or more different plant protein powerhouses in a single day.',
      category: 'protein',
      tier: 'mythic',
      icon: '👑',
      xpReward: 750,
      fuelLore: 'Combining tofu, tempeh, hemp seeds, and nutritional yeast maximizes the full PDCAAS score.',
      isUnlocked: maxProteinStaplesInDay >= 4,
      progressPct: Math.min(100, Math.round((maxProteinStaplesInDay / 4) * 100)),
      currentValueText: `${maxProteinStaplesInDay} staples`,
      targetValueText: '4 staples in 1 day',
    },

    // ================= CALISTHENICS SKILL MEDALS =================
    {
      id: 'calisthenics-first-step',
      title: 'Iron Foundation',
      subtitle: 'First Calisthenics Milestone',
      description: 'Logged your very first calisthenics workout or mastered Wall Push-Ups.',
      category: 'calisthenics',
      tier: 'bronze',
      icon: '🧱',
      xpReward: 150,
      fuelLore: 'All masters started with simple bodyweight geometry against a wall or doorframe.',
      isUnlocked: totalWorkouts > 0 || wallPushPr >= 15,
      progressPct: totalWorkouts > 0 || wallPushPr >= 15 ? 100 : Math.min(100, Math.round((wallPushPr / 15) * 100)),
      currentValueText: `${wallPushPr || totalWorkouts} reps/sets`,
      targetValueText: '15 wall reps or 1 workout',
    },
    {
      id: 'calisthenics-pushup-20',
      title: 'Push-Up Centurion',
      subtitle: '20 Clean Floor Push-Ups',
      description: 'Achieved a Personal Record of 20 or more strict floor push-ups in a set.',
      category: 'calisthenics',
      tier: 'silver',
      icon: '⚡',
      xpReward: 350,
      fuelLore: '20 strict floor push-ups proves significant relative body strength and core stability.',
      isUnlocked: standardPushPr >= 20,
      progressPct: Math.min(100, Math.round((standardPushPr / 20) * 100)),
      currentValueText: `${standardPushPr} reps`,
      targetValueText: '20 strict floor reps',
    },
    {
      id: 'calisthenics-diamond',
      title: 'Diamond Core Overload',
      subtitle: 'Tier 3 Diamond Push-Ups',
      description: 'Unlocked and logged 12+ reps on Diamond Push-Ups to overload triceps and inner pecs.',
      category: 'calisthenics',
      tier: 'gold',
      icon: '💎',
      xpReward: 450,
      fuelLore: 'Hand triangles drastically increase elbow moment arm, driving localized hypertrophy.',
      isUnlocked: diamondPr >= 12,
      progressPct: Math.min(100, Math.round((diamondPr / 12) * 100)),
      currentValueText: `${diamondPr} reps`,
      targetValueText: '12 diamond reps',
    },
    {
      id: 'calisthenics-puller',
      title: 'Back & Scapula Forge',
      subtitle: 'Tier 2 Australian Rows',
      description: 'Mastered 12+ reps on Inverted Australian Rows to build dense lats and biceps.',
      category: 'calisthenics',
      tier: 'gold',
      icon: '🧗',
      xpReward: 450,
      fuelLore: 'Horizontal pulling protects posture and balances heavy pushing volume.',
      isUnlocked: australianRowsPr >= 12,
      progressPct: Math.min(100, Math.round((australianRowsPr / 12) * 100)),
      currentValueText: `${australianRowsPr} reps`,
      targetValueText: '12 inverted rows',
    },
    {
      id: 'calisthenics-archer',
      title: 'Archer of Olympus',
      subtitle: 'Tier 4 Unilateral Chest Power',
      description: 'Conquered Tier 4 Archer Push-Ups, shifting your bodyweight across unilateral leverage.',
      category: 'calisthenics',
      tier: 'diamond',
      icon: '🏹',
      xpReward: 650,
      fuelLore: 'Unilateral pushing bridges the gap to the legendary One-Arm Push-Up.',
      isUnlocked: archerPr >= 6,
      progressPct: Math.min(100, Math.round((archerPr / 6) * 100)),
      currentValueText: `${archerPr} reps`,
      targetValueText: '6 archer reps per side',
    },
    {
      id: 'calisthenics-handstand',
      title: 'Apex Inversion (Gravity Defier)',
      subtitle: 'Tier 4 Handstand Push-Ups',
      description: 'Mastered Wall Handstand Push-Ups, pressing your full bodyweight vertically overhead.',
      category: 'calisthenics',
      tier: 'mythic',
      icon: '🤸',
      xpReward: 900,
      fuelLore: 'The pinnacle of upper-body relative pushing strength. Pure vegan power defeating gravity.',
      isUnlocked: handstandPr >= 5,
      progressPct: Math.min(100, Math.round((handstandPr / 5) * 100)),
      currentValueText: `${handstandPr} reps`,
      targetValueText: '5 handstand push-up reps',
    },
    {
      id: 'calisthenics-pistol',
      title: 'Single-Leg Pistol Champion',
      subtitle: 'Tier 3+ Pistol Squat Mastery',
      description: 'Mastered single-leg quad stability and balance with 8+ clean pistol squat reps.',
      category: 'calisthenics',
      tier: 'diamond',
      icon: '🦵',
      xpReward: 600,
      fuelLore: 'Pistol squats build explosive quad strength without needing heavy iron barbells.',
      isUnlocked: pistolPr >= 8,
      progressPct: Math.min(100, Math.round((pistolPr / 8) * 100)),
      currentValueText: `${pistolPr} reps`,
      targetValueText: '8 pistol squat reps',
    },

    // ================= PLANT VITALITY MEDALS =================
    {
      id: 'vitality-hydration',
      title: 'Oceanic Tendon Lubrication',
      subtitle: '2500ml+ Clean Water in 1 Day',
      description: 'Drank 2500ml or more water in a single day to maximize tendon resilience and glycogen transport.',
      category: 'vitality',
      tier: 'bronze',
      icon: '💧',
      xpReward: 150,
      fuelLore: 'Tendons are largely water and collagen. Dehydration impairs calisthenics joint strength.',
      isUnlocked: maxWaterMl >= 2500,
      progressPct: Math.min(100, Math.round((maxWaterMl / 2500) * 100)),
      currentValueText: `${maxWaterMl}ml`,
      targetValueText: '2500ml in 1 day',
    },
    {
      id: 'vitality-micros',
      title: 'Rainbow Micronutrient Shield',
      subtitle: '80%+ Daily Micronutrient Score',
      description: 'Covered over 80% of daily essential B12, Iron, Calcium, and Zinc targets.',
      category: 'vitality',
      tier: 'silver',
      icon: '🛡️',
      xpReward: 300,
      fuelLore: 'Micronutrient sufficiency ensures high red blood cell oxygen transport during intense training.',
      isUnlocked: maxMicrosScore >= 80,
      progressPct: Math.min(100, Math.round((maxMicrosScore / 80) * 100)),
      currentValueText: `${maxMicrosScore}%`,
      targetValueText: '80% coverage',
    },
    {
      id: 'vitality-warrior-level',
      title: 'Warrior Rank Centurion',
      subtitle: 'Warrior Level 3+ Reached',
      description: 'Amassed over 700 lifetime XP by conquering exercise skill nodes across the Mind-Tree.',
      category: 'vitality',
      tier: 'gold',
      icon: '🏆',
      xpReward: 500,
      fuelLore: 'Your body is adapting: greater myofibrillar density, faster neural drive, and deep recovery.',
      isUnlocked: totalXP >= 700,
      progressPct: Math.min(100, Math.round((totalXP / 700) * 100)),
      currentValueText: `${totalXP} XP`,
      targetValueText: '700 lifetime XP',
    },
  ];

  return achievements;
};
