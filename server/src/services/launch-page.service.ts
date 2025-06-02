import { LaunchPage, ILaunchPage } from '../models/launch-page.model';
import { geminiService } from './gemini.service';

export class LaunchPageService {  async createLaunchPage(pageData: {
    userId: string;
    name: string;
    description?: string;
    tagline?: string;
    colorPalette?: string;
    theme?: string;
  }): Promise<ILaunchPage> {
    const { userId, name, description, tagline, colorPalette, theme } = pageData;

    // Create a placeholder entry with generating status
    const placeholder = await LaunchPage.create({
      userId,
      name,
      description,
      tagline,
      colorPalette,
      theme,
      htmlContent: '<div>Generating...</div>',
      status: 'generating'
    });

    // Start the generation process asynchronously without awaiting it
    this.generatePageContent(placeholder.id, name, description, tagline, colorPalette, theme)
      .catch(error => {
        console.error('Error in background generation process:', error);
      });

    // Return the placeholder immediately
    return placeholder;
  }

  async getLaunchPage(id: string): Promise<ILaunchPage | null> {
    return LaunchPage.findById(id);
  }

  async getUserLaunchPages(userId: string): Promise<ILaunchPage[]> {
    return LaunchPage.findByUserId(userId);
  }

  async updateLaunchPage(id: string, updates: Partial<Pick<ILaunchPage, 'name' | 'description' | 'tagline'>>): Promise<ILaunchPage | null> {
    return LaunchPage.updateById(id, updates);
  }

  async deleteLaunchPage(id: string): Promise<boolean> {
    return LaunchPage.deleteById(id);
  }

  async regenerateLaunchPage(id: string): Promise<ILaunchPage> {
    const page = await LaunchPage.findById(id);
    if (!page) {
      throw new Error('Launch page not found');
    }

    // Update status to generating
    await LaunchPage.updateById(id, { status: 'generating' });

    try {      // Generate new HTML content
      const htmlContent = await geminiService.generateLaunchPage({
        name: page.name,
        description: page.description,
        tagline: page.tagline,
        colorPalette: page.colorPalette,
        theme: page.theme
      });

      // Update with new content
      const updatedPage = await LaunchPage.updateById(id, {
        htmlContent,
        status: 'generated'
      });

      return updatedPage || page;
    } catch (error) {
      console.error('Error regenerating launch page:', error);
      
      // Update status to error
      await LaunchPage.updateById(id, { status: 'error' });
      
      throw error;
    }
  }

  async publishLaunchPage(id: string, slug: string): Promise<ILaunchPage | null> {
    return LaunchPage.publishBySlug(id, slug);
  }

  async getPublishedPageBySlug(slug: string): Promise<ILaunchPage | null> {
    return LaunchPage.findBySlug(slug);
  }
  // Private method to handle the asynchronous generation process
  private async generatePageContent(
    pageId: string,
    name: string,
    description?: string,
    tagline?: string,
    colorPalette?: string,
    theme?: string
  ): Promise<void> {
    try {      // Generate HTML content using Gemini AI
      const htmlContent = await geminiService.generateLaunchPage({
        name,
        description,
        tagline,
        colorPalette,
        theme
      });

      // Update the launch page with generated content
      await LaunchPage.updateById(pageId, {
        htmlContent,
        status: 'generated'
      });

    } catch (error) {
      console.error('Error generating launch page content:', error);
      
      // Update status to error
      await LaunchPage.updateById(pageId, {
        status: 'error',
        htmlContent: '<div>Error generating page. Please try again.</div>'
      });
    }
  }
}

export const launchPageService = new LaunchPageService();
