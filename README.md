### Blair's Files

This web app allows you to take some of Blair's files.

### Local Development

1. Copy `.env.example` to `.env.local` and fill in your AWS credentials:
   ```
   NEXT_PUBLIC_AWS_REGION="your-region"
   NEXT_PUBLIC_AWS_ACCESS_KEY_ID="your-access-key"
   NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY="your-secret-key"
   NEXT_PUBLIC_AWS_BUCKET_NAME="your-bucket-name"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

### Deployment to Vercel

1. Push your code to GitHub if you haven't already:
   ```bash
   git add .
   git commit -m "pushing up"
   git push
   ```

2. Go to [Vercel](https://vercel.com) and sign in with your GitHub account

3. Click "New Project" and import your GitHub repository

4. In the project settings, add the following environment variables:
   ```
   NEXT_PUBLIC_AWS_REGION
   NEXT_PUBLIC_AWS_ACCESS_KEY_ID
   NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY
   NEXT_PUBLIC_AWS_BUCKET_NAME
   ```

5. Deploy! Vercel will automatically build and deploy your site

### Important Notes

- Make sure your AWS credentials have the necessary permissions for S3 operations
- The S3 bucket must have CORS configured to allow requests from your Vercel domain
- Never commit your `.env.local` file or any files containing real credentials