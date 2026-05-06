import { Metadata } from 'next';
import connectToDatabase from '@/lib/mongodb';
import Post from '@/models/Post';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  await connectToDatabase();
  const post = await Post.findById(params.id).lean();

  if (!post) {
    return {
      title: 'Post Not Found | Fin Huwa',
    };
  }

  const type = post.type === 'lost' ? 'Lost' : 'Found';
  const title = `${type}: ${post.title} in ${post.city}`;
  const description = `${post.description.substring(0, 150)}... Reported in ${post.city}, Morocco. Help reconnect this item with its owner.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: post.imageUrl ? [post.imageUrl] : [],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: post.imageUrl ? [post.imageUrl] : [],
    },
  };
}

export default function PostLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
