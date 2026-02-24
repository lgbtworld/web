import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import PostDetails from '../../src/components/PostDetails';
import { SSRPage, type SSRPageProps, createSSRPageProps } from '../../lib/ssr-props';

export const getServerSideProps: GetServerSideProps<SSRPageProps> = async (context) => {
  const postId = String(context.params?.postId || '');
  return {
    props: await createSSRPageProps(context, `/status/${postId}`),
  };
};

export default function Page(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <SSRPage {...props}>
      <PostDetails />
    </SSRPage>
  );
}
