import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../utils/config';

const genAI = new GoogleGenerativeAI(config.gemini.apiKey || 'AIzaSyAHUFfOA4lildkHmB73fCov6fD-MKjdq3M');

export class GeminiService {
  private model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  async generateLaunchPage(pageData: {
    name: string;
    description?: string;
    tagline?: string;
  }): Promise<string> {
    const { name, description, tagline } = pageData;

    const prompt = `
Generate a complete, stunning, and modern launch page in a single HTML file for a project with the following details:

Project Name: ${name}
Description: ${description || 'No description provided'}
Tagline: ${tagline || 'No tagline provided'}

Requirements:
1. Create a complete HTML document with embedded CSS and minimal JavaScript
2. Design should be modern, professional, and visually appealing
3. Must be fully responsive for both mobile and desktop
4. Include the following sections:
   - Hero section with project name and tagline
   - About/Description section
   - Features section (create 3-4 relevant features based on the description)
   - Contact/CTA section
5. Use a modern color scheme (prefer gradients, shadows, and modern design trends)
6. Include smooth animations and hover effects
7. Use modern fonts (Google Fonts)
8. Include proper meta tags for SEO
9. Make it production-ready

The HTML should be complete and ready to use. Do not include any markdown formatting or code blocks - just return the raw HTML content.

Make the design unique and tailored to the project name and description provided.
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
  }

  async generateFeatures(projectName: string, description?: string): Promise<string[]> {
    const prompt = `
Based on this project:
Name: ${projectName}
Description: ${description || 'No description provided'}

Generate 4 relevant and compelling features for this project. Return only a JSON array of strings, no other text.
Example: ["Feature 1", "Feature 2", "Feature 3", "Feature 4"]
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
      // Return default features if generation fails
      return [
        'Easy to use interface',
        'Modern and responsive design',
        'Fast and reliable performance',
        'Secure and scalable architecture'
      ];
    }
  }
}

export const geminiService = new GeminiService();
