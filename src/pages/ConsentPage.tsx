
import { ConsentPage as GenericConsentPage } from 'rssa-study-template';

const ConsentContent: React.FC = () => {
    return (
        <>
            <p className='informedConsent-title font-bold mt-4'>
                Key Information About the Research Study
            </p>
            <p className="mb-2">
                <span className='font-bold'>
                    Voluntary Consent:&nbsp;
                </span>
                Dr. Bart Knijnenburg is inviting you to volunteer for a
                research study. Dr. Knijnenburg is an associate professor
                at Clemson University. He will conduct the study with Lijie
                and Mehtab (both graduate students at Clemson University).
            </p>

            <p className="mb-2">
                <span className='font-bold'>
                    Alternative to Participation:&nbsp;
                </span>
                Participation is voluntary, and the only alternative is to
                not participate. You will not be punished in any way if you
                decide not to be in the study or to stop taking part in the
                study.
            </p>
            <p className="mb-2">
                If you decide not to take part or to stop taking part in
                this study, it will not affect you in any way.
            </p>

            <p className="mb-2">
                <span className='font-bold'>
                    Study Purpose:&nbsp;
                </span>
                The purpose of this research is to evaluate a movie
                recommender system and better understand your
                experiences with the system through your responses to
                the post-task questionnaire.
            </p>

            <p className="mb-2">
                <span className='font-bold'>
                    Activities and Procedures:&nbsp;
                </span>
                Your part in this study will be viewing some
                recommendations and completing a quick post-task survey.
                It will take you about 10-15 minutes to be in this study,
                but please make yourself available for 20 minutes just in
                case.
            </p>

            <p className="mb-2">
                <span className='font-bold'>
                    Risks and Benefits:&nbsp;
                </span>
                We do not know of any risks or discomforts to you in this
                study. The only benefit to you is the learning experience
                from participating in a research study. The benefit to
                society is the contribution to scientific knowledge.
            </p>

            <p className='font-bold mt-4'>Incentives</p>
            <p className="mb-2">
                Participants who complete all tasks will be compensated
                with $2.40. Successful and careful completion of the tasks
                is a prerequisite for payment.
            </p>

            <p className='font-bold mt-4'>
                Audio/Video Recording and Photographs
            </p>
            <p className="mb-2">
                This session will not be audio/video recorded.
            </p>

            <p className='font-bold mt-4'>
                Protection of Privacy and Confidentiality
            </p>
            <p className="mb-2">
                No identifiable information will be collected during the study.
                The anonymous information collected in this study could be used
                for future research studies or distributed to another
                investigator for future research studies without additional
                informed consent from the participants or legally authorized
                representative.
            </p>
            <p className="mb-2">
                The results of this study may be published in scientific
                journals, professional publications, or educational
                presentations. Published results will not include
                identifiable information.
            </p>

            <p className='font-bold mt-4'>
                Contact Information
            </p>
            <p className="mb-2">
                If you have any questions or concerns about your rights in this research study,
                please contact the Clemson University Office of Research Compliance (ORC) at
                864-656-0636 or <a href="mailto:irb@clemson.edu" className="text-blue-600 hover:underline">irb@clemson.edu</a>. If you are
                outside of the Upstate South Carolina area, please use the ORC's toll-free number,
                866-297-3071. The Clemson IRB will not be able to answer some study-specific
                questions. However, you may contact the Clemson IRB if the research staff cannot
                be reached or if you wish to speak with someone other than the research staff.
            </p>
            <p className="mb-2">
                If you have any study related questions or if any problem arise, please contact
                Lijie <a href="mailto:lydiahsu7@gmail.com" className="text-blue-600 hover:underline">lydiahsu7@gmail.com</a>.
            </p>
        </>
    )
}

const ConsentPage: React.FC = () => {
    // FIXME: These should be environment variables or constants
    const PARTICIPANT_TYPE_ID = '149078d0-cece-4b2c-81cd-a7df4f76d15a';
    const PARTICIPANT_EXTERNAL_ID = 'test_user';

    return (
        <GenericConsentPage
            participantTypeId={PARTICIPANT_TYPE_ID}
            externalId={PARTICIPANT_EXTERNAL_ID}
            itemTitle="Testing an Interactive Movie Recommender System Using Emotions for Diversification"
            title="" /// Title is embedded in content for specific formatting in original
        >
            <ConsentContent />
        </GenericConsentPage>
    );
};

export default ConsentPage;
