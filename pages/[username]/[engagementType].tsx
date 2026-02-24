import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import ProfileEngagementsScreen from '../../src/components/ProfileEngagementsScreen';
import { SSRPage, type SSRPageProps, createSSRPageProps } from '../../lib/ssr-props';

export const getServerSideProps: GetServerSideProps<SSRPageProps> = async (context) => {
  const username = String(context.params?.username || '');
  const engagementType = String(context.params?.engagementType || '');
  return {
    props: await createSSRPageProps(context, `/${username}/${engagementType}`),
  };
};

export default function Page(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <SSRPage {...props}>
      <ProfileEngagementsScreen />
    </SSRPage>
  );
}
