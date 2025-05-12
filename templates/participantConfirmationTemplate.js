const participantConfirmationTemplate = (firstName) => {
  return `
    <p>Dear ${firstName},</p>

    <p>Thank you for entering the <strong>Week of the Baby</strong> contest! Your entry has been successfully uploaded.</p>

    <p>🗓️ Voting is open from <strong>Monday to Saturday</strong>, and you can vote every <strong>30 minutes</strong>.</p>

    <p>🎁 One lucky winner will receive a <strong>Rs 500 gift voucher</strong>.</p>

    <p>If you have any questions or need assistance, please contact us at <a href="mailto:query@mycutebaby.in">query@mycutebaby.in</a>.</p>

    <p>Good luck!</p>

    <p>Best regards,<br/>
    Week of the Baby Team</p>
  `;
};

export default participantConfirmationTemplate;
