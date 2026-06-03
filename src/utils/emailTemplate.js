export const baseTemplate = (title, message) => {
  return `
  <div style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 20px;">
    
    <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden;">
      
      <div style="background: #0f766e; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">Tee Naturals 🌿</h1>
      </div>

      <div style="padding: 20px; color: #333;">
        <h2>${title}</h2>
        <p>${message}</p>
      </div>

      <div style="background: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #777;">
        © ${new Date().getFullYear()} Tee Naturals. All rights reserved.
      </div>

    </div>

  </div>
  `;
};