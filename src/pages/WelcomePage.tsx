import { WelcomePage as GenericWelcomePage } from "@rssa-project/study-template";

const WelcomeContent: React.FC = () => {
  return (
    <div className="mb-6">
      <div className="bg-gray-50 rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 instructionblurb">
          <h5 className="text-xl font-medium mb-4">What can you expect?</h5>
          <p className="mb-4">
            In this study you will test a new recommender system for movies.
          </p>
          <p className="mb-2">There are four steps to the study:</p>
          <ol className="list-decimal list-inside mb-4 space-y-2">
            <li>Complete a pre-survey.</li>
            <li>
              Rate a few movies you are familiar with to let recommender system
              know about your movie preferences.
            </li>
            <li>
              Interact with the movie recommender system, then pick one movie
              you would most like to watch.
            </li>
            <li>Complete a post-survey.</li>
          </ol>
          <p>
            Thanks,
            <br />
            Research Team
          </p>
        </div>
      </div>
    </div>
  );
};

const WelcomePage: React.FC<{
  isStudyReady: boolean;
  onStudyStart: () => void;
}> = (props) => {
  return <GenericWelcomePage {...props} ContentComponent={WelcomeContent} />;
};

export default WelcomePage;
