import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../utils/config';

const genAI = new GoogleGenerativeAI(config.gemini.apiKey);

export class GeminiService {
  private model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });  async generateLaunchPage(pageData: {
    name: string;
    description?: string;
    tagline?: string;
    colorPalette?: string;
    theme?: string;
  }): Promise<string> {    const { name, description, tagline, colorPalette, theme } = pageData;    const prompt = `
Generate a complete, stunning pre-launch page in a single HTML file for a project with the following details:

Project Name: ${name}
Description: ${description || 'No description provided'}
Tagline: ${tagline || 'No tagline provided'}
Color Palette: ${colorPalette || 'Modern Blue'}
Design Theme: ${theme || 'Light'}

STYLING GUIDELINES:
- Use the specified color palette "${colorPalette || 'Modern Blue'}" as the primary colors for the design
- Apply the "${theme || 'Light'}" theme throughout the page
- Ensure visual elements, buttons, headers, and accents use colors from the specified palette
- Adjust the overall mood and feel to match the specified design theme
- For Dark theme: use darker backgrounds with light text
- For Light theme: use lighter backgrounds with dark text
- For Warm theme: emphasize warmer tones from the palette
- For Cold theme: emphasize cooler tones from the palette
- For Pastel theme: soften the colors to create a gentle, pastel appearance
- For Vintage/Retro themes: add subtle texture and muted tones
- For Neon theme: brighten key elements for high contrast and glow effects
- For Gold theme: incorporate gold accents and premium feel

REQUIREMENTS - Create a high-converting pre-launch page with these ESSENTIAL ELEMENTS:

🚀 PRE-LAUNCH PAGE STRUCTURE (in order):
1. **Hero Section**:
   - Project name as prominent headline (stylized logo text if no logo)
   - Catchy tagline (1-line pitch communicating value)
   - Brief description (2-4 sentences: problem + unique solution)
   - NO placeholder images - use pure CSS visual elements, gradients, or geometric shapes instead
   - Primary CTA button ("Join Waitlist" / "Get Early Access" / "Notify Me")

2. **Email Capture Form**:
   - Prominent, above-the-fold email input + submit button
   - Compelling form headline ("Be the first to know" / "Get exclusive early access")
   - Modern, conversion-optimized form styling

3. **Social Proof Section**:
   - Waitlist counter ("Join 1,247+ early adopters")
   - Trust indicators and credibility elements using text and icons only
   - NO company logo placeholders - use text-based testimonials or social mentions

4. **What's Coming / Key Features**:
   - 3-4 key features with CSS icons, emoji icons, or font-awesome style icons
   - Focus on benefits and excitement for what's coming
   - Use compelling feature headlines with visual icons (not images)

5. **Incentives Section**:
   - Early bird rewards ("First 100 get lifetime access")
   - Limited-time offers or exclusive benefits
   - Urgency and scarcity elements

6. **Footer**:
   - Social media links (Twitter, LinkedIn, etc.)
   - Contact information
   - Additional CTAs

🎨 DESIGN PRINCIPLES:
- Bold, attention-grabbing hero with modern gradients/animations
- Clean, professional typography with excellent hierarchy
- High-contrast colors optimized for conversions
- Mobile-first responsive design
- Smooth animations and micro-interactions
- Modern card layouts with shadows and rounded corners
- NO IMAGES OR PLACEHOLDERS - use pure CSS visual elements instead
- Create visual interest with gradients, shapes, patterns, and typography
- Use CSS icons, Unicode symbols, or emoji for visual elements
- Focus on clean, minimal design without broken image elements

COLOR AND THEME IMPLEMENTATION:
- For "Modern Blue" palette: Use blue tones for primary elements, with light backgrounds for "Light" theme or dark backgrounds for "Dark" theme
- For "Forest Green" palette: Use green tones with appropriate contrast based on the theme
- For "Ruby Red" palette: Incorporate red accents with complementary colors based on the theme
- For "Sunset Orange" palette: Use warm orange/yellow tones adjusted for the selected theme
- For "Royal Purple" palette: Apply purple accents and gradients throughout the design
- For "Ocean Teal" palette: Implement teal and complementary blues based on theme
- For "Midnight" palette: Use dark blues/blacks with appropriate contrast elements

THEME ADAPTATIONS:
- "Pastel" theme: Use softer, muted versions of the palette colors
- "Vintage" theme: Add sepia tones and classic design elements
- "Retro" theme: Incorporate bold geometric patterns and classic computing aesthetics
- "Neon" theme: Use bright, glowing color effects with dark backgrounds
- "Gold" theme: Add gold accents and luxury design elements
- "Light" theme: Use bright backgrounds with appropriate contrast text
- "Dark" theme: Use dark backgrounds with lighter text and accents
- "Warm" theme: Emphasize warm tones (reds, oranges, yellows)
- "Cold" theme: Emphasize cold tones (blues, cyans, cool purples)

📧 CONVERSION OPTIMIZATION:
- Multiple email capture opportunities throughout page
- Clear, action-oriented CTAs with compelling copy
- Social proof elements to build trust and FOMO
- Benefit-focused messaging over feature lists
- Urgency/scarcity elements to drive immediate action
- Mobile-optimized forms and buttons

🎭 VISUAL ELEMENTS (NO IMAGES):
- Animated background elements (CSS gradients, geometric shapes, particles)
- CSS-only icons using Unicode symbols, pseudo-elements, or font icons
- Hover effects on all clickable elements
- Smooth scroll animations
- Loading animations for form submissions using pure CSS
- Interactive waitlist counter with animated numbers
- Modern button animations and states
- Geometric patterns and shapes created with CSS
- NO placeholder images, broken images, or img tags without valid sources

⚡ TECHNICAL REQUIREMENTS:
- Single HTML file with embedded CSS and minimal JavaScript
- Google Fonts integration for modern typography
- Vanilla JS for interactions (no external dependencies)
- SEO-optimized meta tags and structure
- Fast loading and optimized performance
- Form validation and success states
- NO external image dependencies - everything visual should be CSS-based

INSPIRATION: Create a page that rivals the best pre-launch pages from successful startups - think Product Hunt featured launches, YC companies, and viral pre-launch campaigns.

The page should feel premium, trustworthy, and create genuine excitement about joining the waitlist.

CRITICAL: Do NOT include any <img> tags, placeholder images, or broken image references. Use only CSS-based visual elements, gradients, shapes, icons made with CSS/Unicode, and typography for all visual appeal.

Return ONLY the raw HTML content without markdown formatting.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const htmlContent = response.text();
      
      // Clean up any potential markdown formatting that might be included
      const cleanedHtml = htmlContent
        .replace(/```html\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      return cleanedHtml;
    } catch (error) {
      console.error('Error generating launch page with Gemini:', error);
      throw new Error('Failed to generate launch page');
    }
  }  async generateFeatures(projectName: string, description?: string): Promise<string[]> {
    const prompt = `
Based on this pre-launch project:
Name: ${projectName}
Description: ${description || 'No description provided'}

Generate 4 compelling "What's Coming" features that will excite potential users and drive waitlist signups.

GUIDELINES for pre-launch features:
- Focus on upcoming benefits and exciting capabilities
- Use future-tense, anticipation-building language
- Make features sound innovative and valuable
- Create excitement about what users will get access to
- Use power words that build anticipation

EXAMPLES of great pre-launch feature headlines:
- "🚀 Lightning-Fast Performance" (speed/efficiency)
- "🎯 AI-Powered Smart Insights" (cutting-edge tech)
- "⚡ One-Click Magic Deployment" (ease of use)
- "🔒 Bank-Level Security Protection" (trust/safety)
- "📱 Seamless Mobile Experience" (accessibility)
- "🎨 Intuitive Drag & Drop Builder" (user-friendly)
- "⏰ Real-Time Collaboration" (teamwork)
- "📊 Advanced Analytics Dashboard" (data insights)
- "🌍 Global CDN Performance" (reliability)
- "💡 Smart Automation Features" (efficiency)

Use emojis to make features more visually appealing and exciting.
Return only a JSON array of 4 feature strings that build anticipation.
Example format: ["🚀 Exciting feature 1", "⚡ Anticipated capability 2", "🎯 Coming soon feature 3", "💡 Revolutionary feature 4"]
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const featuresText = response.text().trim();
      
      // Try to parse as JSON
      const features = JSON.parse(featuresText);
      return Array.isArray(features) ? features : [];
    } catch (error) {
      console.error('Error generating features:', error);
      // Return enhanced default pre-launch features if generation fails
      return [
        '🚀 Lightning-Fast Performance',
        '🔒 Enterprise-Grade Security',
        '📱 Mobile-First Experience',
        '⚡ One-Click Deployment'
      ];
    }
  }
}

export const geminiService = new GeminiService();
