const roles = {
    admin: {
      permissions: [
        'registerBaby',
        'voteForBaby',
        'voterSignup',
        'voterLogin',
        'getBabyVoters',
        'unvoteForBaby',
        'weeklyParticipants',
        'weeklyVoters',
        'declareWinner'
      ]
    },
    user: {
      permissions: [
        'registerBaby',
        'voteForBaby',
        'voterSignup',
        'voterLogin',
        'getBabyVoters',
        'unvoteForBaby'
      ]
    },
    voter: {
      permissions: [
        'voteForBaby',
        'voterSignup',
        'voterLogin',
        'getBabyVoters',
        'unvoteForBaby'
      ]
    }
  };
  
export {
    roles
};